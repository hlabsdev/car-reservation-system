from rest_framework import filters
from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.permissions import IsAuthenticated
from .models import Car
from .serializers import CarSerializer

class CarViewSet(ReadOnlyModelViewSet):
    queryset = Car.objects.all()
    serializer_class = CarSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['registration_number', 'brand', 'model']
    ordering_fields = ['brand', 'model', 'year', 'created_at']
    ordering = ['-created_at']
