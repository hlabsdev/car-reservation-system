from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

from apps.cars.models import Car, CarStatus
from apps.reservations.models import Reservation, ReservationStatus

User = get_user_model()


class Command(BaseCommand):
    help = 'Crée des données de test pour le système de réservation'

    def handle(self, *args, **options):
        self.stdout.write('Création des données de test...')

        # Créer utilisateurs
        admin, _ = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@togodatalab.tg',
                'first_name': 'Admin',
                'last_name': 'System',
                'is_staff': True,
                'is_superuser': True
            }
        )
        admin.set_password('admin123')
        admin.save()
        self.stdout.write(f'Admin créé: {admin.username} / admin123')

        users_data = [
            ('kofi', 'kofi@togodatalab.tg', 'Kofi', 'Mensah'),
            ('ama', 'ama@togodatalab.tg', 'Ama', 'Adjovi'),
            ('kwame', 'kwame@togodatalab.tg', 'Kwame', 'Tetteh'),
        ]

        users = []
        for username, email, first_name, last_name in users_data:
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': email,
                    'first_name': first_name,
                    'last_name': last_name
                }
            )
            user.set_password('test123')
            user.save()
            users.append(user)
            status_icon = '-' if created else '°'
            self.stdout.write(f'{status_icon} User: {username} / test123')

        # Créer véhicules
        cars_data = [
            ('TG-123-AA', 'Toyota', 'Hilux', 2023, CarStatus.AVAILABLE),
            ('TG-456-BB', 'Nissan', 'Patrol', 2022, CarStatus.AVAILABLE),
            ('TG-789-CC', 'Ford', 'Ranger', 2023, CarStatus.AVAILABLE),
            ('TG-012-DD', 'Mitsubishi', 'L200', 2021, CarStatus.MAINTENANCE),
            ('TG-345-EE', 'Toyota', 'Land Cruiser', 2024, CarStatus.AVAILABLE),
        ]

        cars = []
        for reg, brand, model, year, status in cars_data:
            car, created = Car.objects.get_or_create(
                registration_number=reg,
                defaults={
                    'brand': brand,
                    'model': model,
                    'year': year,
                    'status': status
                }
            )
            cars.append(car)
            status_icon = '-' if created else '°'
            self.stdout.write(f'{status_icon} Véhicule: {reg} - {brand} {model}')

        # Créer quelques réservations exemple
        now = timezone.now()
        reservations_data = [
            (users[0], cars[0], now + timedelta(days=1), now + timedelta(days=3),
             'Mission terrain région Maritime'),
            (users[1], cars[1], now + timedelta(days=5), now + timedelta(days=7),
             'Collecte de données Savanes'),
            (users[2], cars[2], now + timedelta(days=10), now + timedelta(days=12),
             'Formation régionale Kara'),
        ]

        for user, car, start, end, purpose in reservations_data:
            reservation, created = Reservation.objects.get_or_create(
                user=user,
                car=car,
                start_date=start,
                defaults={
                    'end_date': end,
                    'purpose': purpose,
                    'status': ReservationStatus.CONFIRMED
                }
            )
            status_icon = '-' if created else '°'
            self.stdout.write(
                f'{status_icon} Réservation: {user.username} - {car.registration_number}'
            )

        self.stdout.write(self.style.SUCCESS('\nDonnées de test créées avec succès!'))
        self.stdout.write('\nConnexions disponibles:')
        self.stdout.write('   Admin: admin / admin123')
        self.stdout.write('   Users: kofi|ama|kwame / test123')
