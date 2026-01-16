from django.db import transaction
from django.db.models import Q
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import datetime
from typing import Optional

from apps.cars.models import CarStatus, Car
from apps.reservations.models import Reservation, ReservationStatus


class ReservationService:
    """
    Service layer pour la logique métier des réservations.
    
    Règles métier implémentées :
    1. Pas de chevauchement de réservations pour un même véhicule
    2. Date de début < date de fin
    3. Pas de réservation dans le passé
    4. Véhicule disponible
    """
    
    @staticmethod
    def validate_date_range(start_date: datetime, end_date: datetime) -> None:
        """Valide que la plage de dates est cohérente."""
        if start_date >= end_date:
            raise ValidationError(
                "La date de début doit être antérieure à la date de fin."
            )
        
        if start_date < timezone.now():
            raise ValidationError(
                "Impossible de créer une réservation dans le passé."
            )
    
    @staticmethod
    def validate_car_availability(car: Car) -> None:
        """Vérifie que le véhicule est disponible."""
        if car.status != CarStatus.AVAILABLE:
            raise ValidationError(
                f"Le véhicule {car.registration_number} n'est pas disponible. "
                f"Statut actuel: {car.get_status_display()}"
            )
    
    @staticmethod
    def check_reservation_overlap(
        car_id: int,
        start_date: datetime,
        end_date: datetime,
        exclude_reservation_id: Optional[int] = None
    ) -> bool:
        """
        RÈGLE MÉTIER CRITIQUE :
        Vérifie s'il existe un chevauchement avec une réservation existante.
        
        Chevauchement détecté si pour deux périodes A et B :
        (start_A < end_B) AND (end_A > start_B)
        
        Args:
            car_id: ID du véhicule
            start_date: Date de début de la nouvelle réservation
            end_date: Date de fin de la nouvelle réservation
            exclude_reservation_id: ID de réservation à exclure (pour updates)
            
        Returns:
            True si chevauchement détecté, False sinon
            
        Raises:
            ValidationError: Si un chevauchement est détecté
        """
        overlapping_reservations = Reservation.objects.filter(
            car_id=car_id,
            status__in=[ReservationStatus.CONFIRMED, ReservationStatus.PENDING]
        ).filter(
            Q(start_date__lt=end_date) & Q(end_date__gt=start_date)
        )
        
        if exclude_reservation_id:
            overlapping_reservations = overlapping_reservations.exclude(
                id=exclude_reservation_id
            )
        
        if overlapping_reservations.exists():
            conflicting = overlapping_reservations.first()
            raise ValidationError(
                f"Conflit détecté avec la réservation #{conflicting.id} "
                f"du {conflicting.start_date.strftime('%d/%m/%Y %H:%M')} "
                f"au {conflicting.end_date.strftime('%d/%m/%Y %H:%M')}. "
                f"Le véhicule {conflicting.car.registration_number} n'est pas disponible "
                f"pour cette période."
            )
        
        return False
    
    @classmethod
    @transaction.atomic
    def create_reservation(
        cls,
        user,
        car_id: int,
        start_date: datetime,
        end_date: datetime,
        purpose: str = ""
    ) -> Reservation:
        """
        Crée une réservation avec validation complète.
        
        Transaction atomique pour éviter les race conditions.
        """
        # Validation plage de dates
        cls.validate_date_range(start_date, end_date)
        
        # Récupération du véhicule
        try:
            car = Car.objects.select_for_update().get(id=car_id)
        except Car.DoesNotExist:
            raise ValidationError(f"Véhicule #{car_id} introuvable.")
        
        # Validation disponibilité véhicule
        cls.validate_car_availability(car)
        
        # RÈGLE CRITIQUE: Validation chevauchement
        cls.check_reservation_overlap(car_id, start_date, end_date)
        
        # Création
        reservation = Reservation.objects.create(
            user=user,
            car=car,
            start_date=start_date,
            end_date=end_date,
            purpose=purpose,
            status=ReservationStatus.CONFIRMED
        )
        
        return reservation
    
    @classmethod
    @transaction.atomic
    def update_reservation(
        cls,
        reservation_id: int,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        purpose: Optional[str] = None
    ) -> Reservation:
        """Met à jour une réservation existante."""
        try:
            reservation = Reservation.objects.select_for_update().get(
                id=reservation_id
            )
        except Reservation.DoesNotExist:
            raise ValidationError(f"Réservation #{reservation_id} introuvable.")
        
        if reservation.status == ReservationStatus.CANCELLED:
            raise ValidationError("Impossible de modifier une réservation annulée.")
        
        # Mise à jour des dates si fournies
        new_start = start_date or reservation.start_date
        new_end = end_date or reservation.end_date
        
        # Validation
        cls.validate_date_range(new_start, new_end)
        cls.check_reservation_overlap(
            reservation.car_id,
            new_start,
            new_end,
            exclude_reservation_id=reservation_id
        )
        
        # Update
        if start_date:
            reservation.start_date = start_date
        if end_date:
            reservation.end_date = end_date
        if purpose is not None:
            reservation.purpose = purpose
            
        reservation.save()
        return reservation
    
    @staticmethod
    def cancel_reservation(reservation_id: int) -> Reservation:
        """Annule une réservation."""
        try:
            reservation = Reservation.objects.get(id=reservation_id)
        except Reservation.DoesNotExist:
            raise ValidationError(f"Réservation #{reservation_id} introuvable.")
        
        if reservation.status == ReservationStatus.CANCELLED:
            raise ValidationError("Cette réservation est déjà annulée.")
        
        reservation.status = ReservationStatus.CANCELLED
        reservation.save()
        return reservation