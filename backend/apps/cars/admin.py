from django.contrib import admin
from .models import Car


@admin.register(Car)
class CarAdmin(admin.ModelAdmin):
    list_display = ['registration_number', 'brand', 'model', 'year', 'status', 'created_at']
    list_filter = ['status', 'brand', 'year']
    search_fields = ['registration_number', 'brand', 'model']
    ordering = ['-created_at']
