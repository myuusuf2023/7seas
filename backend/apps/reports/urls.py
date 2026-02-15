from django.urls import path
from . import views

urlpatterns = [
    path('payment-receipt/<int:payment_id>/', views.generate_payment_receipt, name='payment-receipt'),
    path('investor-statement/<int:investor_id>/', views.generate_investor_statement, name='investor-statement'),
]
