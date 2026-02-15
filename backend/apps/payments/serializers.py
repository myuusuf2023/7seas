from rest_framework import serializers
from .models import Payment
from apps.investors.models import Investor


class PaymentListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for payment list views.
    Includes investor name and computed properties.
    """
    investor_name = serializers.CharField(source='investor.full_name', read_only=True)
    investor_email = serializers.EmailField(source='investor.email', read_only=True)
    payment_type_display = serializers.CharField(source='get_payment_type_display', read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    is_overdue = serializers.ReadOnlyField()
    days_overdue = serializers.ReadOnlyField()
    verified_by_username = serializers.CharField(source='verified_by.username', read_only=True, allow_null=True)

    class Meta:
        model = Payment
        fields = [
            'id',
            'investor',
            'investor_name',
            'investor_email',
            'payment_type',
            'payment_type_display',
            'amount',
            'payment_status',
            'payment_status_display',
            'payment_method',
            'payment_method_display',
            'payment_date',
            'due_date',
            'is_overdue',
            'days_overdue',
            'reference_number',
            'quarter',
            'verification_date',
            'verified_by_username',
            'created_at',
        ]


class PaymentDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for single payment views.
    Includes all fields and relationships.
    """
    investor_name = serializers.CharField(source='investor.full_name', read_only=True)
    investor_email = serializers.EmailField(source='investor.email', read_only=True)
    payment_type_display = serializers.CharField(source='get_payment_type_display', read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    is_overdue = serializers.ReadOnlyField()
    days_overdue = serializers.ReadOnlyField()
    verified_by_username = serializers.CharField(source='verified_by.username', read_only=True, allow_null=True)

    class Meta:
        model = Payment
        fields = [
            'id',
            'investor',
            'investor_name',
            'investor_email',
            'payment_type',
            'payment_type_display',
            'amount',
            'payment_status',
            'payment_status_display',
            'payment_method',
            'payment_method_display',
            'payment_date',
            'due_date',
            'verification_date',
            'verified_by',
            'verified_by_username',
            'reference_number',
            'quarter',
            'receipt_document',
            'notes',
            'is_overdue',
            'days_overdue',
            'created_at',
            'updated_at',
        ]


class PaymentCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating payments.
    Includes validation for required fields.
    """

    class Meta:
        model = Payment
        fields = [
            'investor',
            'payment_type',
            'amount',
            'payment_method',
            'payment_date',
            'due_date',
            'reference_number',
            'quarter',
            'receipt_document',
            'notes',
        ]

    def validate_amount(self, value):
        """Ensure amount is positive"""
        if value <= 0:
            raise serializers.ValidationError("Payment amount must be greater than zero.")
        return value

    def validate(self, data):
        """
        Validate payment data.
        - Check if investor exists and is active
        - Warn if amount exceeds outstanding balance (but don't block it)
        """
        investor = data.get('investor')

        if investor and investor.investor_status != 'ACTIVE':
            raise serializers.ValidationError({
                'investor': 'Cannot create payment for inactive investor.'
            })

        return data


class PaymentVerifySerializer(serializers.Serializer):
    """
    Serializer for payment verification action.
    Used when admin verifies a payment.
    """
    notes = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text='Optional verification notes'
    )

    def update(self, instance, validated_data):
        """Verify the payment"""
        notes = validated_data.get('notes', '')
        if notes:
            instance.notes = f"{instance.notes}\n\nVerification notes: {notes}".strip()

        # The view will call verify_payment method
        return instance
