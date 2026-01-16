from rest_framework import serializers
from .models import Car


class CarSerializer(serializers.ModelSerializer):
    status_display = serializers.SerializerMethodField()

    class Meta:
        model = Car
        fields = [
            'id', 'registration_number', 'brand', 'model', 'year', 'status',
            'created_at', 'updated_at', 'status_display'
        ]
        read_only_fields = ['status', 'created_at', 'updated_at']

    def get_status_display(self, obj):
        return obj.get_status_display()
