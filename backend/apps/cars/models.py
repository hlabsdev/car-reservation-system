from django.db import models

class CarStatus(models.TextChoices):
    AVAILABLE = 'AVAILABLE', 'Disponible'
    IN_USE = 'IN_USE', 'En utilisation'
    MAINTENANCE = 'MAINTENANCE', 'En maintenance'
    UNAVAILABLE = 'UNAVAILABLE', 'Indisponible'

class Car(models.Model):
    registration_number = models.CharField(max_length=20, unique=True, verbose_name="Immatriculation")
    brand = models.CharField(max_length=50, verbose_name="Marque")
    model = models.CharField(max_length=50, verbose_name="Modèle")
    year = models.IntegerField(verbose_name="Année")
    status = models.CharField(
        max_length=20,
        choices=CarStatus.choices,
        default=CarStatus.AVAILABLE,
        verbose_name="Statut"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'cars'
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.brand} {self.model} ({self.registration_number})"