from rest_framework import serializers
from .models import Reservation
from apps.cars.serializers import CarSerializer
from apps.users.serializers import UserSerializer


class ReservationSerializer(serializers.ModelSerializer):
    car_detail = CarSerializer(source='car', read_only=True)
    user_detail = UserSerializer(source='user', read_only=True)

    class Meta:
        model = Reservation
        fields = [
            'id', 'user', 'user_detail', 'car', 'car_detail',
            'start_date', 'end_date', 'status', 'purpose',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'status', 'created_at', 'updated_at']


class ReservationCreateSerializer(serializers.Serializer):
    car_id = serializers.IntegerField()
    start_date = serializers.DateTimeField()
    end_date = serializers.DateTimeField()
    purpose = serializers.CharField(required=False, allow_blank=True)