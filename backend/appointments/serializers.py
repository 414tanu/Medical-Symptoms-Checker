from rest_framework import serializers
from .models import Appointment

class AppointmentSerializer(serializers.ModelSerializer):
    clinic_name = serializers.CharField(source='clinic.name', read_only=True)

    class Meta:
        model = Appointment
        fields = ['id', 'user', 'clinic', 'clinic_name', 'appointment_date', 'status', 'notes', 'created_at']
        read_only_fields = ['user', 'created_at']
