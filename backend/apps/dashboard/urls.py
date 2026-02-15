from django.urls import path
from . import views

urlpatterns = [
    path('overview/', views.overview, name='dashboard-overview'),
    path('collections-timeline/', views.collections_timeline, name='dashboard-collections-timeline'),
    path('payment-status/', views.payment_status_distribution, name='dashboard-payment-status'),
    path('overdue-investors/', views.overdue_investors, name='dashboard-overdue-investors'),
    path('recent-activity/', views.recent_activity, name='dashboard-recent-activity'),
    path('top-investors/', views.top_investors, name='dashboard-top-investors'),
]
