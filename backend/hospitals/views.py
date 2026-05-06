from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import Clinic
from .serializers import ClinicSerializer
import math


@api_view(['GET'])
@permission_classes([AllowAny])
def clinic_list(request):
    district = (
        request.query_params.get('district')
        or request.query_params.get('location')
        or request.query_params.get('search')
    )
    queryset = Clinic.objects.all()
    if district:
        filtered = queryset.filter(district__icontains=district)
        # Also try name search
        if not filtered.exists():
            filtered = queryset.filter(name__icontains=district)
        queryset = filtered if filtered.exists() else queryset

    serializer = ClinicSerializer(queryset, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def nearest_clinics(request):
    lat = request.query_params.get('lat')
    lng = request.query_params.get('lng')
    if not lat or not lng:
        return Response({'error': 'lat, lng required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user_lat = float(lat)
        user_lng = float(lng)
    except ValueError:
        return Response({'error': 'lat, lng must be numeric'}, status=status.HTTP_400_BAD_REQUEST)

    clinics = Clinic.objects.all()
    results = []
    for clinic in clinics:
        dist = haversine_km(user_lat, user_lng, clinic.lat, clinic.lng)
        results.append((dist, clinic))

    # Sort by distance and return top 10
    results.sort(key=lambda x: x[0])
    nearest = results[:10]

    # Build enriched response with distance field (BUG FIX: distance now included)
    data = []
    for dist, clinic in nearest:
        s = ClinicSerializer(clinic).data
        s['distance'] = round(dist, 2)   # ← FIX: was never returned before
        data.append(s)

    return Response(data)


def haversine_km(lat1, lng1, lat2, lng2):
    radius = 6371
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = (math.sin(dlat / 2) ** 2
         + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng / 2) ** 2)
    return radius * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
