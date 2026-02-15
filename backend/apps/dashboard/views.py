from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum, Count, Q, F
from django.utils import timezone
from decimal import Decimal
from datetime import timedelta
from collections import defaultdict

from apps.investors.models import Investor
from apps.payments.models import Payment
from apps.investors.serializers import InvestorListSerializer
from apps.payments.serializers import PaymentListSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def overview(request):
    """
    Dashboard overview with key performance indicators (KPIs).

    GET /api/dashboard/overview/

    Returns:
        - project_target: Fixed project target ($800,000)
        - total_committed: Sum of all investor share amounts
        - total_raised: Sum of all verified payments
        - total_outstanding: Total committed minus total raised
        - collection_rate: Percentage collected (total_raised / total_committed * 100)
        - target_achieved_rate: Percentage of project target achieved
        - total_investors: Total number of investors
        - active_investors: Number of active investors
        - verified_payments_count: Number of verified payments
        - pending_payments_count: Number of pending payments
        - overdue_payments_count: Number of overdue payments
        - lp_count: Number of Limited Partners
        - gp_count: Number of General Partners
        - kyc_pending_count: Number of investors with KYC pending
    """
    # Project target (fixed at $800,000)
    PROJECT_TARGET = Decimal('800000.00')

    # Investor metrics
    total_investors = Investor.objects.count()
    active_investors = Investor.objects.filter(investor_status='ACTIVE').count()

    lp_count = Investor.objects.filter(investor_type='LP').count()
    gp_count = Investor.objects.filter(investor_type='GP').count()

    kyc_pending_count = Investor.objects.filter(kyc_status='PENDING').count()

    # Financial metrics
    total_committed = Investor.objects.aggregate(
        total=Sum('share_amount')
    )['total'] or Decimal('0.00')

    total_raised = Payment.objects.filter(
        payment_status='VERIFIED'
    ).aggregate(
        total=Sum('amount')
    )['total'] or Decimal('0.00')

    total_outstanding = total_committed - total_raised

    # Collection rate (of committed amount)
    collection_rate = 0
    if total_committed > 0:
        collection_rate = float((total_raised / total_committed) * 100)

    # Target achieved rate (of project target)
    target_achieved_rate = 0
    if PROJECT_TARGET > 0:
        target_achieved_rate = float((total_committed / PROJECT_TARGET) * 100)

    # Payment metrics
    verified_payments_count = Payment.objects.filter(payment_status='VERIFIED').count()
    pending_payments_count = Payment.objects.filter(payment_status='PENDING').count()

    overdue_payments_count = Payment.objects.filter(
        payment_status='PENDING',
        due_date__lt=timezone.now().date()
    ).count()

    return Response({
        'project_target': str(PROJECT_TARGET),
        'total_committed': str(total_committed),
        'total_raised': str(total_raised),
        'total_outstanding': str(total_outstanding),
        'collection_rate': round(collection_rate, 2),
        'target_achieved_rate': round(target_achieved_rate, 2),
        'total_investors': total_investors,
        'active_investors': active_investors,
        'verified_payments_count': verified_payments_count,
        'pending_payments_count': pending_payments_count,
        'overdue_payments_count': overdue_payments_count,
        'lp_count': lp_count,
        'gp_count': gp_count,
        'kyc_pending_count': kyc_pending_count,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def collections_timeline(request):
    """
    Collections timeline for chart visualization.

    GET /api/dashboard/collections-timeline/?period=monthly

    Query Parameters:
        - period: 'monthly' (default), 'weekly', or 'quarterly'

    Returns:
        - labels: List of time period labels
        - data: List of collection amounts for each period
    """
    period = request.query_params.get('period', 'monthly')

    # Get verified payments ordered by date
    payments = Payment.objects.filter(
        payment_status='VERIFIED'
    ).order_by('payment_date')

    if not payments.exists():
        return Response({
            'labels': [],
            'data': []
        })

    # Group payments by period
    timeline_data = defaultdict(Decimal)

    for payment in payments:
        if period == 'weekly':
            # Group by week
            key = f"Week {payment.payment_date.isocalendar()[1]} {payment.payment_date.year}"
        elif period == 'quarterly':
            # Group by quarter
            quarter = (payment.payment_date.month - 1) // 3 + 1
            key = f"Q{quarter} {payment.payment_date.year}"
        else:  # monthly (default)
            # Group by month
            key = payment.payment_date.strftime('%b %Y')

        timeline_data[key] += payment.amount

    # Sort by date and prepare response
    labels = list(timeline_data.keys())
    data = [str(timeline_data[label]) for label in labels]

    return Response({
        'labels': labels,
        'data': data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_status_distribution(request):
    """
    Payment status distribution for pie/donut chart.

    GET /api/dashboard/payment-status/

    Returns count of payments by status:
        - verified: Number of verified payments
        - pending: Number of pending payments
        - failed: Number of failed payments
        - overdue: Number of overdue payments
    """
    verified = Payment.objects.filter(payment_status='VERIFIED').count()
    pending = Payment.objects.filter(payment_status='PENDING', due_date__gte=timezone.now().date()).count()
    failed = Payment.objects.filter(payment_status='FAILED').count()
    overdue = Payment.objects.filter(
        payment_status='PENDING',
        due_date__lt=timezone.now().date()
    ).count()

    return Response({
        'verified': verified,
        'pending': pending,
        'failed': failed,
        'overdue': overdue
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def overdue_investors(request):
    """
    List of investors with overdue payments.

    GET /api/dashboard/overdue-investors/

    Returns list of investors who have overdue payments with details.
    """
    overdue_payments = Payment.objects.filter(
        payment_status='PENDING',
        due_date__lt=timezone.now().date()
    ).select_related('investor').order_by('due_date')

    # Group by investor
    investor_overdue = {}
    for payment in overdue_payments:
        investor_id = payment.investor.id
        if investor_id not in investor_overdue:
            investor_overdue[investor_id] = {
                'investor_id': investor_id,
                'investor_name': payment.investor.full_name,
                'investor_email': payment.investor.email,
                'investor_type': payment.investor.investor_type,
                'total_overdue_amount': Decimal('0.00'),
                'overdue_payments_count': 0,
                'oldest_due_date': payment.due_date,
            }
        investor_overdue[investor_id]['total_overdue_amount'] += payment.amount
        investor_overdue[investor_id]['overdue_payments_count'] += 1

    # Convert to list and add days overdue
    result = []
    for data in investor_overdue.values():
        days_overdue = (timezone.now().date() - data['oldest_due_date']).days
        data['days_overdue'] = days_overdue
        data['total_overdue_amount'] = str(data['total_overdue_amount'])
        data['oldest_due_date'] = data['oldest_due_date'].isoformat()
        result.append(data)

    # Sort by days overdue (descending)
    result.sort(key=lambda x: x['days_overdue'], reverse=True)

    return Response(result)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recent_activity(request):
    """
    Recent payment activity for dashboard feed.

    GET /api/dashboard/recent-activity/

    Returns last 10 payments (verified, pending, or failed) with investor info.
    """
    recent_payments = Payment.objects.select_related(
        'investor', 'verified_by'
    ).order_by('-created_at')[:10]

    serializer = PaymentListSerializer(recent_payments, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def top_investors(request):
    """
    Top investors by share amount or total paid.

    GET /api/dashboard/top-investors/?by=share_amount

    Query Parameters:
        - by: 'share_amount' (default) or 'total_paid'

    Returns top 10 investors.
    """
    sort_by = request.query_params.get('by', 'share_amount')

    if sort_by == 'total_paid':
        # Sort by total paid (computed property - we'll do this in Python)
        investors = list(Investor.objects.filter(investor_status='ACTIVE'))
        investors.sort(key=lambda x: x.total_paid, reverse=True)
        investors = investors[:10]
    else:
        # Sort by share amount
        investors = Investor.objects.filter(
            investor_status='ACTIVE'
        ).order_by('-share_amount')[:10]

    serializer = InvestorListSerializer(investors, many=True)
    return Response(serializer.data)
