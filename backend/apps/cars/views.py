# from rest_framework import filters
# from rest_framework.viewsets import ReadOnlyModelViewSet
# from rest_framework.permissions import IsAuthenticated
# from .models import Car
# from .serializers import CarSerializer
#
# class CarViewSet(ReadOnlyModelViewSet):
#     queryset = Car.objects.all()
#     serializer_class = CarSerializer
#     permission_classes = [IsAuthenticated]
#     pagination_class = None
#     filter_backends = [filters.SearchFilter, filters.OrderingFilter]
#     search_fields = ['registration_number', 'brand', 'model']
#     ordering_fields = ['brand', 'model', 'year', 'created_at']
#     ordering = ['-created_at']

from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Car, CarStatus
from .serializers import CarSerializer


class CarViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet pour les véhicules.
    ReadOnly car seuls les admins créent/modifient les véhicules.
    """
    queryset = Car.objects.all()
    serializer_class = CarSerializer
    permission_classes = [IsAuthenticated]
    # ✅ FIX: Désactiver la pagination
    pagination_class = None
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['registration_number', 'brand', 'model']
    ordering_fields = ['brand', 'model', 'year', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filtre par disponibilité
        available_only = self.request.query_params.get('available', None)
        if available_only == 'true':
            queryset = queryset.filter(status=CarStatus.AVAILABLE)

        return queryset

    @action(detail=True, methods=['get'])
    def availability(self, request, pk=None):
        """
        Vérifie la disponibilité d'un véhicule pour une période.
        Query params: start_date, end_date (ISO format)
        """
        car = self.get_object()
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        if not start_date or not end_date:
            return Response(
                {'error': 'start_date et end_date requis'},
                status=400
            )

        from datetime import datetime
        from apps.reservations.services import ReservationService

        try:
            start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))

            # Vérifie les conflits
            try:
                ReservationService.check_reservation_overlap(
                    car.id, start, end
                )
                return Response({'available': True})
            except Exception as e:
                return Response({
                    'available': False,
                    'reason': str(e)
                })

        except ValueError:
            return Response(
                {'error': 'Format de date invalide. Utilisez ISO 8601'},
                status=400
            )