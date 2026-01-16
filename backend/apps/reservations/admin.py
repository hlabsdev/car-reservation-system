from django.contrib import admin
from .models import Reservation


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ['user', 'car', 'start_date', 'end_date', 'status', 'purpose', 'created_at']
    list_filter = ['status', 'purpose', 'user', 'car']
    search_fields = ['status', 'purpose', 'start_date', 'end_date']
    ordering = ['-created_at']