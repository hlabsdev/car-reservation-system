from django.db import models
from django.conf import settings

from apps.cars.models import Car

class ReservationStatus(models.TextChoices):
    PENDING = 'PENDING', 'En attente'
    CONFIRMED = 'CONFIRMED', 'Confirmée'
    CANCELLED = 'CANCELLED', 'Annulée'
    COMPLETED = 'COMPLETED', 'Terminée'

class Reservation(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reservations',
        verbose_name="Utilisateur"
    )
    car = models.ForeignKey(
        Car,
        on_delete=models.CASCADE,
        related_name='reservations',
        verbose_name="Véhicule"
    )
    start_date = models.DateTimeField(verbose_name="Date de début")
    end_date = models.DateTimeField(verbose_name="Date de fin")
    status = models.CharField(
        max_length=20,
        choices=ReservationStatus.choices,
        default=ReservationStatus.CONFIRMED,
        verbose_name="Statut"
    )
    purpose = models.TextField(blank=True, verbose_name="Motif de la mission")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'reservations'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['car', 'start_date', 'end_date']),
            models.Index(fields=['status']),
        ]
        
    def __str__(self):
        return f"Réservation #{self.id} - {self.car} ({self.start_date.date()})"