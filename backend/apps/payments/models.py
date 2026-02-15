from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal
from django.utils import timezone
from apps.authentication.models import User
from apps.investors.models import Investor


class Payment(models.Model):
    """
    Payment model for tracking investor payments including entry fees and quarterly payments.
    Supports payment verification workflow and overdue tracking.
    """

    PAYMENT_TYPE_CHOICES = [
        ('ENTRY_FEE', 'Entry Fee'),
        ('QUARTERLY', 'Quarterly Payment'),
        ('SHARE_PURCHASE', 'Share Purchase'),
        ('OTHER', 'Other'),
    ]

    STATUS_CHOICES = [
        ('PENDING', 'Pending Verification'),
        ('VERIFIED', 'Verified'),
        ('FAILED', 'Failed'),
        ('REFUNDED', 'Refunded'),
    ]

    METHOD_CHOICES = [
        ('BANK_TRANSFER', 'Bank Transfer'),
        ('WIRE', 'Wire Transfer'),
        ('CHECK', 'Check'),
        ('CASH', 'Cash'),
        ('OTHER', 'Other'),
    ]

    # Relationships
    investor = models.ForeignKey(
        Investor,
        on_delete=models.CASCADE,
        related_name='payments',
        help_text='Investor making this payment'
    )

    # Payment Details
    payment_type = models.CharField(
        max_length=20,
        choices=PAYMENT_TYPE_CHOICES,
        help_text='Type of payment'
    )
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text='Payment amount'
    )
    payment_status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='PENDING',
        help_text='Current status of the payment'
    )
    payment_method = models.CharField(
        max_length=20,
        choices=METHOD_CHOICES,
        help_text='Payment method used'
    )

    # Dates
    payment_date = models.DateField(
        help_text='Date when payment was made'
    )
    due_date = models.DateField(
        null=True,
        blank=True,
        help_text='Expected payment due date'
    )
    verification_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text='Date and time when payment was verified'
    )

    # Verification
    verified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_payments',
        help_text='User who verified this payment'
    )

    # Additional Details
    reference_number = models.CharField(
        max_length=100,
        blank=True,
        default='',
        help_text='Bank reference or transaction number'
    )
    quarter = models.CharField(
        max_length=10,
        blank=True,
        default='',
        help_text='Quarter identifier (e.g., Q1 2024)'
    )
    receipt_document = models.FileField(
        upload_to='payment_receipts/%Y/%m/',
        null=True,
        blank=True,
        help_text='Uploaded payment receipt or proof'
    )
    notes = models.TextField(
        blank=True,
        default='',
        help_text='Additional notes about the payment'
    )

    # Audit Fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-payment_date', '-created_at']
        verbose_name = 'Payment'
        verbose_name_plural = 'Payments'
        indexes = [
            models.Index(fields=['payment_status']),
            models.Index(fields=['payment_type']),
            models.Index(fields=['payment_date']),
            models.Index(fields=['investor', 'payment_status']),
            models.Index(fields=['due_date']),
        ]

    def __str__(self):
        return f"{self.investor.full_name} - {self.get_payment_type_display()} - ${self.amount}"

    @property
    def is_overdue(self):
        """Check if payment is overdue"""
        if self.payment_status != 'PENDING' or not self.due_date:
            return False
        return self.due_date < timezone.now().date()

    @property
    def days_overdue(self):
        """Calculate number of days overdue"""
        if not self.is_overdue:
            return 0
        delta = timezone.now().date() - self.due_date
        return delta.days

    def verify_payment(self, user):
        """
        Verify the payment and set verification details.

        Args:
            user: The User object who is verifying the payment
        """
        self.payment_status = 'VERIFIED'
        self.verification_date = timezone.now()
        self.verified_by = user
        self.save(update_fields=['payment_status', 'verification_date', 'verified_by', 'updated_at'])

    def mark_failed(self, reason=''):
        """
        Mark payment as failed.

        Args:
            reason: Optional reason for failure
        """
        self.payment_status = 'FAILED'
        if reason:
            self.notes = f"{self.notes}\n\nFailed: {reason}".strip()
        self.save(update_fields=['payment_status', 'notes', 'updated_at'])
