from django.urls import path
from . import views

urlpatterns = [
    path('list/', views.clinic_list, name='clinic_list'),
    path('nearest/', views.nearest_clinics, name='nearest_clinics'),
]
