import APIClient
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta

from apps.cars.models import CarStatus, Car
from apps.reservations.models import ReservationStatus
from apps.reservations.services import ReservationService

User = get_user_model()


class ReservationServiceTestCase(TestCase):
    """Tests unitaires du service de réservation."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

        self.car = Car.objects.create(
            registration_number='ABC-123',
            brand='Toyota',
            model='Corolla',
            year=2023,
            status=CarStatus.AVAILABLE
        )

        self.now = timezone.now()
        self.tomorrow = self.now + timedelta(days=1)
        self.in_two_days = self.now + timedelta(days=2)
        self.in_three_days = self.now + timedelta(days=3)

    def test_create_reservation_success(self):
        """Test création réservation valide."""
        reservation = ReservationService.create_reservation(
            user=self.user,
            car_id=self.car.id,
            start_date=self.tomorrow,
            end_date=self.in_two_days,
            purpose="Mission terrain"
        )

        self.assertIsNotNone(reservation.id)
        self.assertEqual(reservation.status, ReservationStatus.CONFIRMED)
        self.assertEqual(reservation.car, self.car)

    def test_create_reservation_past_date_fails(self):
        """Test: est-ce que c'est impossible de réserver dans le passé ?"""
        past = self.now - timedelta(days=1)

        with self.assertRaises(ValidationError) as context:
            ReservationService.create_reservation(
                user=self.user,
                car_id=self.car.id,
                start_date=past,
                end_date=self.tomorrow
            )

        self.assertIn("passé", str(context.exception))

    def test_create_reservation_invalid_date_range_fails(self):
        """Test: date début >= date fin."""
        with self.assertRaises(ValidationError) as context:
            ReservationService.create_reservation(
                user=self.user,
                car_id=self.car.id,
                start_date=self.in_two_days,
                end_date=self.tomorrow
            )

        self.assertIn("antérieure", str(context.exception))

    def test_create_reservation_overlap_exact_fails(self):
        """Test: chevauchement exact."""
        # Première réservation
        ReservationService.create_reservation(
            user=self.user,
            car_id=self.car.id,
            start_date=self.tomorrow,
            end_date=self.in_two_days
        )

        # Tentative de réservation identique
        with self.assertRaises(ValidationError) as context:
            ReservationService.create_reservation(
                user=self.user,
                car_id=self.car.id,
                start_date=self.tomorrow,
                end_date=self.in_two_days
            )

        self.assertIn("Conflit", str(context.exception))

    def test_create_reservation_overlap_partial_fails(self):
        """Test: chevauchement partiel."""
        # Première réservation : demain → dans 2 jours
        ReservationService.create_reservation(
            user=self.user,
            car_id=self.car.id,
            start_date=self.tomorrow,
            end_date=self.in_two_days
        )

        # Tentative : dans 2 jours - 1h → dans 3 jours (chevauche)
        overlap_start = self.in_two_days - timedelta(hours=1)

        with self.assertRaises(ValidationError):
            ReservationService.create_reservation(
                user=self.user,
                car_id=self.car.id,
                start_date=overlap_start,
                end_date=self.in_three_days
            )

    def test_create_reservation_consecutive_succeeds(self):
        """Test: réservations consécutives (pas de chevauchement)."""
        # Première réservation
        ReservationService.create_reservation(
            user=self.user,
            car_id=self.car.id,
            start_date=self.tomorrow,
            end_date=self.in_two_days
        )

        # Deuxième réservation : commence quand la première finit
        reservation2 = ReservationService.create_reservation(
            user=self.user,
            car_id=self.car.id,
            start_date=self.in_two_days,
            end_date=self.in_three_days
        )

        self.assertIsNotNone(reservation2.id)

    def test_create_reservation_car_unavailable_fails(self):
        """Test: véhicule non disponible."""
        self.car.status = CarStatus.MAINTENANCE
        self.car.save()

        with self.assertRaises(ValidationError) as context:
            ReservationService.create_reservation(
                user=self.user,
                car_id=self.car.id,
                start_date=self.tomorrow,
                end_date=self.in_two_days
            )

        self.assertIn("pas disponible", str(context.exception))
        

class ReservationViewSetTestCase(TestCase):
    """Tests des endpoints API."""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        
        self.car = Car.objects.create(
            registration_number='TEST-001',
            brand='Test',
            model='Model',
            year=2024,
            status=CarStatus.AVAILABLE
        )
    
    def test_list_reservations_authenticated(self):
        """Test: liste réservations nécessite authentification."""
        self.client.logout()
        response = self.client.get('/api/reservations/')
        self.assertEqual(response.status_code, 401)
    
    def test_create_reservation_success(self):
        """Test: création réservation via API."""
        now = timezone.now()
        data = {
            'car_id': self.car.id,
            'start_date': (now + timedelta(days=1)).isoformat(),
            'end_date': (now + timedelta(days=2)).isoformat(),
            'purpose': 'Test mission'
        }
        
        response = self.client.post('/api/reservations/', data, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['purpose'], 'Test mission')
    
    def test_create_reservation_conflict_returns_400(self):
        """Test: conflit retourne 400."""
        now = timezone.now()
        start = now + timedelta(days=1)
        end = now + timedelta(days=2)
        
        # Première réservation
        ReservationService.create_reservation(
            user=self.user,
            car_id=self.car.id,
            start_date=start,
            end_date=end
        )
        
        # Tentative de conflit
        data = {
            'car_id': self.car.id,
            'start_date': start.isoformat(),
            'end_date': end.isoformat(),
            'purpose': 'Conflict'
        }
        
        response = self.client.post('/api/reservations/', data, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.data)