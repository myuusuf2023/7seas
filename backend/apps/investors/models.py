from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal
from django.utils import timezone
from apps.authentication.models import User


class Investor(models.Model):
    """
    Investor model representing shareholders in the 7-Seas Suites investment project.
    Supports both Limited Partners (LP) and General Partners (GP).
    """

    INVESTOR_TYPE_CHOICES = [
        ('LP', 'Limited Partner'),
        ('GP', 'General Partner'),
    ]

    KYC_STATUS_CHOICES = [
        ('PENDING', 'Pending Verification'),
        ('VERIFIED', 'Verified'),
        ('REJECTED', 'Rejected'),
    ]

    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
        ('SUSPENDED', 'Suspended'),
    ]

    # Personal Information
    first_name = models.CharField(max_length=100, help_text='Investor first name')
    last_name = models.CharField(max_length=100, help_text='Investor last name')
    email = models.EmailField(unique=True, help_text='Unique email address')
    phone = models.CharField(
        max_length=20,
        blank=True,
        default='',
        help_text='Contact phone number'
    )

    # Investment Details
    investor_type = models.CharField(
        max_length=2,
        choices=INVESTOR_TYPE_CHOICES,
        help_text='Limited Partner or General Partner'
    )
    share_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text='Total committed investment amount'
    )
    shares_owned = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text='Number of shares/units owned'
    )
    entry_fee_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        default=Decimal('0.00'),
        help_text='One-time entry fee amount'
    )
    quarterly_payment_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        default=Decimal('0.00'),
        help_text='Recurring quarterly payment amount'
    )

    # KYC and Status
    kyc_status = models.CharField(
        max_length=10,
        choices=KYC_STATUS_CHOICES,
        default='PENDING',
        help_text='KYC verification status'
    )
    kyc_verified_date = models.DateField(
        null=True,
        blank=True,
        help_text='Date when KYC was verified'
    )
    investor_status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='ACTIVE',
        help_text='Current investor status'
    )

    # Dates
    joined_date = models.DateField(
        help_text='Date when investor joined the project'
    )

    # Additional Information
    notes = models.TextField(
        blank=True,
        default='',
        help_text='Internal admin notes about the investor'
    )

    # Audit Fields
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_investors',
        help_text='User who created this investor record'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Investor'
        verbose_name_plural = 'Investors'
        indexes = [
            models.Index(fields=['investor_type']),
            models.Index(fields=['kyc_status']),
            models.Index(fields=['investor_status']),
            models.Index(fields=['email']),
        ]

    def __str__(self):
        return f"{self.full_name} ({self.get_investor_type_display()})"

    @property
    def full_name(self):
        """Returns the investor's full name"""
        return f"{self.first_name} {self.last_name}".strip()

    @property
    def total_paid(self):
        """Calculate total amount paid from verified payments"""
        from apps.payments.models import Payment
        total = self.payments.filter(
            payment_status='VERIFIED'
        ).aggregate(
            total=models.Sum('amount')
        )['total']
        return total or Decimal('0.00')

    @property
    def outstanding_balance(self):
        """Calculate outstanding balance (share amount minus total paid)"""
        return self.share_amount - self.total_paid

    @property
    def payment_completion_percentage(self):
        """Calculate payment completion percentage"""
        if self.share_amount == 0:
            return 0
        return float((self.total_paid / self.share_amount) * 100)

    @property
    def is_overdue(self):
        """Check if investor has any overdue payments"""
        from apps.payments.models import Payment
        return self.payments.filter(
            payment_status='PENDING',
            due_date__lt=timezone.now().date()
        ).exists()
