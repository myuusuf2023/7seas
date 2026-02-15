from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InvestorViewSet

router = DefaultRouter()
router.register(r'', InvestorViewSet, basename='investor')

urlpatterns = [
    path('', include(router.urls)),
]
