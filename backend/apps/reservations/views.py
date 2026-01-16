from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.core.exceptions import ValidationError as DjangoValidationError

from .models import Reservation
from .serializers import ReservationSerializer, ReservationCreateSerializer
from .services import ReservationService


class ReservationViewSet(viewsets.ModelViewSet):
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        """Utilisateur voit uniquement ses réservations."""
        return Reservation.objects.filter(
            user=self.request.user
        ).select_related('car', 'user')

    def create(self, request, *args, **kwargs):
        """Crée une réservation via le service."""
        serializer = ReservationCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            reservation = ReservationService.create_reservation(
                user=request.user,
                **serializer.validated_data
            )

            return Response(
                ReservationSerializer(reservation).data,
                status=status.HTTP_201_CREATED
            )
        except DjangoValidationError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Annule une réservation."""
        reservation = self.get_object()

        try:
            updated = ReservationService.cancel_reservation(reservation.id)
            return Response(ReservationSerializer(updated).data)
        except DjangoValidationError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )