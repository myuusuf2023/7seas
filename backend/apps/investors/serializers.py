from rest_framework import serializers
from .models import Investor
from apps.authentication.models import User


class InvestorListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for investor list views.
    Includes computed properties for display in tables.
    """
    full_name = serializers.ReadOnlyField()
    total_paid = serializers.ReadOnlyField()
    outstanding_balance = serializers.ReadOnlyField()
    payment_completion_percentage = serializers.ReadOnlyField()
    is_overdue = serializers.ReadOnlyField()
    investor_type_display = serializers.CharField(source='get_investor_type_display', read_only=True)
    kyc_status_display = serializers.CharField(source='get_kyc_status_display', read_only=True)
    investor_status_display = serializers.CharField(source='get_investor_status_display', read_only=True)

    class Meta:
        model = Investor
        fields = [
            'id',
            'full_name',
            'first_name',
            'last_name',
            'email',
            'phone',
            'investor_type',
            'investor_type_display',
            'share_amount',
            'total_paid',
            'outstanding_balance',
            'payment_completion_percentage',
            'kyc_status',
            'kyc_status_display',
            'investor_status',
            'investor_status_display',
            'joined_date',
            'is_overdue',
            'created_at',
        ]


class InvestorDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for single investor views.
    Includes all fields and computed properties.
    """
    full_name = serializers.ReadOnlyField()
    total_paid = serializers.ReadOnlyField()
    outstanding_balance = serializers.ReadOnlyField()
    payment_completion_percentage = serializers.ReadOnlyField()
    is_overdue = serializers.ReadOnlyField()
    investor_type_display = serializers.CharField(source='get_investor_type_display', read_only=True)
    kyc_status_display = serializers.CharField(source='get_kyc_status_display', read_only=True)
    investor_status_display = serializers.CharField(source='get_investor_status_display', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True, allow_null=True)

    class Meta:
        model = Investor
        fields = [
            'id',
            'full_name',
            'first_name',
            'last_name',
            'email',
            'phone',
            'investor_type',
            'investor_type_display',
            'share_amount',
            'shares_owned',
            'entry_fee_amount',
            'quarterly_payment_amount',
            'total_paid',
            'outstanding_balance',
            'payment_completion_percentage',
            'kyc_status',
            'kyc_status_display',
            'kyc_verified_date',
            'investor_status',
            'investor_status_display',
            'joined_date',
            'notes',
            'is_overdue',
            'created_by',
            'created_by_username',
            'created_at',
            'updated_at',
        ]


class InvestorCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and updating investors.
    Includes validation and write-only fields.
    """

    class Meta:
        model = Investor
        fields = [
            'first_name',
            'last_name',
            'email',
            'phone',
            'investor_type',
            'share_amount',
            'shares_owned',
            'entry_fee_amount',
            'quarterly_payment_amount',
            'kyc_status',
            'kyc_verified_date',
            'investor_status',
            'joined_date',
            'notes',
        ]

    def validate_email(self, value):
        """Ensure email is unique (case insensitive)"""
        # For update operations, exclude the current instance
        queryset = Investor.objects.filter(email__iexact=value)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError("An investor with this email already exists.")
        return value.lower()

    def validate_share_amount(self, value):
        """Ensure share amount is positive"""
        if value <= 0:
            raise serializers.ValidationError("Share amount must be greater than zero.")
        return value


class InvestorSummarySerializer(serializers.ModelSerializer):
    """
    Serializer for investor financial summary.
    Used for quick overview and dashboard widgets.
    """
    full_name = serializers.ReadOnlyField()
    total_paid = serializers.ReadOnlyField()
    outstanding_balance = serializers.ReadOnlyField()
    payment_completion_percentage = serializers.ReadOnlyField()
    is_overdue = serializers.ReadOnlyField()

    class Meta:
        model = Investor
        fields = [
            'id',
            'full_name',
            'share_amount',
            'total_paid',
            'outstanding_balance',
            'payment_completion_percentage',
            'is_overdue',
            'entry_fee_amount',
            'quarterly_payment_amount',
        ]
