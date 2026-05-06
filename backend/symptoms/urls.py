from django.urls import path
from . import views

urlpatterns = [
    path('analyze/', views.analyze_symptoms, name='analyze_symptoms'),
]
