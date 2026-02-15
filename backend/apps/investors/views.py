from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import FilterSet, CharFilter, ChoiceFilter

from .models import Investor
from .serializers import (
    InvestorListSerializer,
    InvestorDetailSerializer,
    InvestorCreateUpdateSerializer,
    InvestorSummarySerializer
)
from apps.authentication.permissions import IsAdminUser


class InvestorFilter(FilterSet):
    """Custom filter for Investor model"""
    investor_type = ChoiceFilter(choices=Investor.INVESTOR_TYPE_CHOICES)
    kyc_status = ChoiceFilter(choices=Investor.KYC_STATUS_CHOICES)
    investor_status = ChoiceFilter(choices=Investor.STATUS_CHOICES)

    class Meta:
        model = Investor
        fields = ['investor_type', 'kyc_status', 'investor_status']


class InvestorViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Investor model providing full CRUD operations.

    list: GET /api/investors/ - List all investors with pagination
    create: POST /api/investors/ - Create new investor
    retrieve: GET /api/investors/{id}/ - Get single investor details
    update: PUT /api/investors/{id}/ - Update investor (all fields)
    partial_update: PATCH /api/investors/{id}/ - Partial update
    destroy: DELETE /api/investors/{id}/ - Soft delete (set INACTIVE)

    Custom actions:
    - summary: GET /api/investors/{id}/summary/ - Get financial summary
    - payments: GET /api/investors/{id}/payments/ - Get all payments for investor
    """
    queryset = Investor.objects.all()
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter
    ]
    filterset_class = InvestorFilter
    search_fields = ['first_name', 'last_name', 'email', 'phone']
    ordering_fields = [
        'first_name',
        'last_name',
        'share_amount',
        'joined_date',
        'created_at'
    ]
    ordering = ['-created_at']

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return InvestorListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return InvestorCreateUpdateSerializer
        elif self.action == 'summary':
            return InvestorSummarySerializer
        return InvestorDetailSerializer

    def perform_create(self, serializer):
        """Set created_by field when creating new investor"""
        serializer.save(created_by=self.request.user)

    def perform_destroy(self, instance):
        """Soft delete: Set investor status to INACTIVE instead of deleting"""
        instance.investor_status = 'INACTIVE'
        instance.save(update_fields=['investor_status', 'updated_at'])

    @action(detail=True, methods=['get'])
    def summary(self, request, pk=None):
        """
        Get financial summary for a specific investor.

        Returns:
            - share_amount
            - total_paid
            - outstanding_balance
            - payment_completion_percentage
            - entry_fee_amount
            - quarterly_payment_amount
        """
        investor = self.get_object()
        serializer = self.get_serializer(investor)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def payments(self, request, pk=None):
        """
        Get all payments for a specific investor.

        Returns list of payments ordered by date (newest first).
        """
        from apps.payments.serializers import PaymentListSerializer
        investor = self.get_object()
        payments = investor.payments.all().order_by('-payment_date')

        # Apply pagination
        page = self.paginate_queryset(payments)
        if page is not None:
            serializer = PaymentListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = PaymentListSerializer(payments, many=True)
        return Response(serializer.data)
