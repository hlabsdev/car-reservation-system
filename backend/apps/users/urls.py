from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, register, me

router = DefaultRouter()
router.register(r'', UserViewSet, basename='user')

urlpatterns = [
    path('register/', register, name='register'),
    path('me/', me, name='me'),
    path('', include(router.urls)),
]
