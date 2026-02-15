from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import FilterSet, ChoiceFilter, DateFromToRangeFilter, NumberFilter
from django.utils import timezone

from .models import Payment
from .serializers import (
    PaymentListSerializer,
    PaymentDetailSerializer,
    PaymentCreateSerializer,
    PaymentVerifySerializer
)
from apps.authentication.permissions import IsAdminUser


class PaymentFilter(FilterSet):
    """Custom filter for Payment model"""
    payment_status = ChoiceFilter(choices=Payment.STATUS_CHOICES)
    payment_type = ChoiceFilter(choices=Payment.PAYMENT_TYPE_CHOICES)
    investor = NumberFilter(field_name='investor__id')
    payment_date = DateFromToRangeFilter()

    class Meta:
        model = Payment
        fields = ['payment_status', 'payment_type', 'investor', 'payment_date']


class PaymentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Payment model providing full CRUD operations and payment verification.

    list: GET /api/payments/ - List all payments with pagination
    create: POST /api/payments/ - Create new payment
    retrieve: GET /api/payments/{id}/ - Get single payment details
    update: PUT /api/payments/{id}/ - Update payment (all fields)
    partial_update: PATCH /api/payments/{id}/ - Partial update
    destroy: DELETE /api/payments/{id}/ - Delete payment (admin only)

    Custom actions:
    - verify: POST /api/payments/{id}/verify/ - Verify a payment
    - fail: POST /api/payments/{id}/fail/ - Mark payment as failed
    - overdue: GET /api/payments/overdue/ - List all overdue payments
    """
    queryset = Payment.objects.select_related('investor', 'verified_by').all()
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter
    ]
    filterset_class = PaymentFilter
    search_fields = [
        'investor__first_name',
        'investor__last_name',
        'investor__email',
        'reference_number',
        'notes'
    ]
    ordering_fields = [
        'payment_date',
        'amount',
        'created_at',
        'verification_date'
    ]
    ordering = ['-payment_date', '-created_at']

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return PaymentListSerializer
        elif self.action == 'create':
            return PaymentCreateSerializer
        elif self.action == 'verify':
            return PaymentVerifySerializer
        return PaymentDetailSerializer

    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """
        Verify a payment.

        POST /api/payments/{id}/verify/

        Body (optional):
        {
            "notes": "Verification notes"
        }

        Returns the updated payment with VERIFIED status.
        """
        payment = self.get_object()

        if payment.payment_status == 'VERIFIED':
            return Response(
                {'detail': 'Payment is already verified.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Update notes if provided
        serializer.update(payment, serializer.validated_data)

        # Verify the payment
        payment.verify_payment(request.user)

        # Return updated payment
        output_serializer = PaymentDetailSerializer(payment)
        return Response(output_serializer.data)

    @action(detail=True, methods=['post'])
    def fail(self, request, pk=None):
        """
        Mark a payment as failed.

        POST /api/payments/{id}/fail/

        Body (optional):
        {
            "reason": "Reason for failure"
        }

        Returns the updated payment with FAILED status.
        """
        payment = self.get_object()

        if payment.payment_status == 'VERIFIED':
            return Response(
                {'detail': 'Cannot mark verified payment as failed.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        reason = request.data.get('reason', '')
        payment.mark_failed(reason)

        # Return updated payment
        serializer = PaymentDetailSerializer(payment)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """
        List all overdue payments.

        GET /api/payments/overdue/

        Returns list of payments with status PENDING and due_date in the past.
        """
        overdue_payments = Payment.objects.filter(
            payment_status='PENDING',
            due_date__lt=timezone.now().date()
        ).select_related('investor', 'verified_by').order_by('due_date')

        # Apply pagination
        page = self.paginate_queryset(overdue_payments)
        if page is not None:
            serializer = PaymentListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = PaymentListSerializer(overdue_payments, many=True)
        return Response(serializer.data)
