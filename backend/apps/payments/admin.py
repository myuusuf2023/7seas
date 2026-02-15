from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    """
    Django admin configuration for Payment model.
    """
    list_display = [
        'id',
        'investor',
        'payment_type',
        'amount',
        'payment_status',
        'payment_date',
        'is_overdue',
        'verification_date',
    ]
    list_filter = [
        'payment_status',
        'payment_type',
        'payment_method',
        'payment_date',
        'created_at',
    ]
    search_fields = [
        'investor__first_name',
        'investor__last_name',
        'investor__email',
        'reference_number',
        'notes',
    ]
    readonly_fields = [
        'is_overdue',
        'days_overdue',
        'created_at',
        'updated_at',
    ]
    fieldsets = (
        ('Investor', {
            'fields': ('investor',)
        }),
        ('Payment Details', {
            'fields': (
                'payment_type',
                'amount',
                'payment_method',
                'payment_status'
            )
        }),
        ('Dates', {
            'fields': (
                'payment_date',
                'due_date',
                'verification_date'
            )
        }),
        ('Verification', {
            'fields': ('verified_by',)
        }),
        ('Additional Details', {
            'fields': (
                'reference_number',
                'quarter',
                'receipt_document',
                'notes'
            )
        }),
        ('Computed Fields', {
            'fields': (
                'is_overdue',
                'days_overdue'
            ),
            'classes': ('collapse',)
        }),
        ('Audit', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    ordering = ['-payment_date', '-created_at']
    date_hierarchy = 'payment_date'
    actions = ['verify_payments', 'mark_as_failed']

    def verify_payments(self, request, queryset):
        """Admin action to verify selected payments"""
        count = 0
        for payment in queryset.filter(payment_status='PENDING'):
            payment.verify_payment(request.user)
            count += 1
        self.message_user(request, f'{count} payment(s) successfully verified.')
    verify_payments.short_description = 'Verify selected payments'

    def mark_as_failed(self, request, queryset):
        """Admin action to mark payments as failed"""
        count = queryset.filter(payment_status='PENDING').update(payment_status='FAILED')
        self.message_user(request, f'{count} payment(s) marked as failed.')
    mark_as_failed.short_description = 'Mark selected payments as failed'
