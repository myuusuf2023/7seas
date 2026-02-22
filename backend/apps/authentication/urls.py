from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView,
    logout_view,
    current_user_view,
    change_password_view,
    user_list_view,
    user_detail_view,
)

urlpatterns = [
    # JWT Authentication
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', logout_view, name='logout'),

    # User Profile
    path('me/', current_user_view, name='current_user'),
    path('change-password/', change_password_view, name='change_password'),

    # Admin User Management
    path('users/', user_list_view, name='user_list'),
    path('users/<int:pk>/', user_detail_view, name='user_detail'),
]
