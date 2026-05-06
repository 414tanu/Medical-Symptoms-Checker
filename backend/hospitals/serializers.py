from rest_framework import serializers
from .models import Clinic

class ClinicSerializer(serializers.ModelSerializer):
    latitude = serializers.FloatField(source='lat', read_only=True)
    longitude = serializers.FloatField(source='lng', read_only=True)
    distance = serializers.SerializerMethodField()

    class Meta:
        model = Clinic
        fields = [
            'id', 'name', 'address', 'lat', 'lng', 'latitude', 'longitude',
            'distance', 'phone', 'district', 'state', 'pincode',
            'type', 'services', 'is_govt', 'verified', 'created_at',
        ]

    def get_distance(self, obj):
        distance = getattr(obj, '_distance_km', None)
        return round(distance, 1) if distance is not None else None
