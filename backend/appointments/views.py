from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from .models import Appointment
from .serializers import AppointmentSerializer
from hospitals.models import Clinic

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def book_appointment(request):
    clinic_id = request.data.get('clinic_id') or request.data.get('clinic')
    appointment_date = request.data.get('appointment_date')
    if not appointment_date and request.data.get('date') and request.data.get('time'):
        appointment_date = f"{request.data.get('date')} {request.data.get('time')}"
    notes = request.data.get('notes') or request.data.get('symptoms') or ''
    if not clinic_id or not appointment_date:
        return Response({'error': 'clinic_id and appointment_date required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        clinic = Clinic.objects.get(id=clinic_id)
    except Clinic.DoesNotExist:
        return Response({'error': 'Clinic not found'}, status=status.HTTP_404_NOT_FOUND)

    parsed_date = parse_datetime(appointment_date)
    if parsed_date:
        if timezone.is_naive(parsed_date):
            parsed_date = timezone.make_aware(parsed_date)
        appointment_date = parsed_date

    appointment = Appointment.objects.create(
        user=request.user,
        clinic=clinic,
        appointment_date=appointment_date,
        notes=notes
    )
    serializer = AppointmentSerializer(appointment)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_appointments(request):
    appointments = Appointment.objects.filter(user=request.user)
    serializer = AppointmentSerializer(appointments, many=True)
    return Response(serializer.data)

