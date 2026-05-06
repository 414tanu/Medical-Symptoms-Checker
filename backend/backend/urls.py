# """
# URL configuration for backend project.

# The `urlpatterns` list routes URLs to views. For more information please see:
#     https://docs.djangoproject.com/en/6.0/topics/http/urls/
# Examples:
# Function views
#     1. Add an import:  from my_app import views
#     2. Add a URL to urlpatterns:  path('', views.home, name='home')
# Including another URLconf
#     1. Import the include() function: from django.urls import include, path
#     2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
# """
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def api_home(request):
    return JsonResponse({
        'message': 'AI Medical Symptom Checker backend is running',
        'endpoints': {
            'admin': '/admin/',
            'login': '/api/users/login/',
            'register': '/api/users/register/',
            'symptom_analysis': '/api/symptoms/analyze/',
            'hospitals': '/api/hospitals/list/',
            'nearest_hospitals': '/api/hospitals/nearest/?lat=25.5941&lng=85.1376',
            'appointments': '/api/appointments/book/',
        },
    })

urlpatterns = [
    path('', api_home, name='api_home'),
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/symptoms/', include('symptoms.urls')),
    path('api/hospitals/', include('hospitals.urls')),
    path('api/appointments/', include('appointments.urls')),
]
