from rest_framework import serializers
from .models import SymptomSubmission

class SymptomSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SymptomSubmission
        fields = ['id', 'user', 'symptoms_text', 'language', 'conditions', 'urgency', 'created_at']
        read_only_fields = ['user', 'conditions', 'created_at', 'urgency']
