from django.contrib import admin
from .models import Investor


@admin.register(Investor)
class InvestorAdmin(admin.ModelAdmin):
    """
    Django admin configuration for Investor model.
    """
    list_display = [
        'full_name',
        'email',
        'investor_type',
        'share_amount',
        'total_paid',
        'outstanding_balance',
        'kyc_status',
        'investor_status',
        'joined_date',
    ]
    list_filter = [
        'investor_type',
        'kyc_status',
        'investor_status',
        'joined_date',
        'created_at',
    ]
    search_fields = [
        'first_name',
        'last_name',
        'email',
        'phone',
    ]
    readonly_fields = [
        'full_name',
        'total_paid',
        'outstanding_balance',
        'payment_completion_percentage',
        'is_overdue',
        'created_at',
        'updated_at',
    ]
    fieldsets = (
        ('Personal Information', {
            'fields': ('first_name', 'last_name', 'email', 'phone')
        }),
        ('Investment Details', {
            'fields': (
                'investor_type',
                'share_amount',
                'shares_owned',
                'entry_fee_amount',
                'quarterly_payment_amount'
            )
        }),
        ('KYC and Status', {
            'fields': (
                'kyc_status',
                'kyc_verified_date',
                'investor_status'
            )
        }),
        ('Dates', {
            'fields': ('joined_date',)
        }),
        ('Computed Fields', {
            'fields': (
                'full_name',
                'total_paid',
                'outstanding_balance',
                'payment_completion_percentage',
                'is_overdue'
            ),
            'classes': ('collapse',)
        }),
        ('Additional Information', {
            'fields': ('notes',)
        }),
        ('Audit', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    ordering = ['-created_at']
    date_hierarchy = 'joined_date'

    def save_model(self, request, obj, form, change):
        """Automatically set created_by when creating new investor"""
        if not change:  # Only on creation
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
