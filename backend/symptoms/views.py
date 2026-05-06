from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
import google.generativeai as genai
from django.conf import settings
import json
import re
from .models import SymptomSubmission
from .serializers import SymptomSubmissionSerializer

PLACEHOLDER_KEYS = {'', 'your_api_key_here', 'your_gemini_api_key_here'}

if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY not in PLACEHOLDER_KEYS:
    genai.configure(api_key=settings.GEMINI_API_KEY)

@api_view(['POST'])
@permission_classes([AllowAny])
def analyze_symptoms(request):
    symptoms_text = request.data.get('symptoms_text') or request.data.get('symptoms') or ''
    language = request.data.get('language', 'en')
    severity = request.data.get('severity', 'moderate')
    duration = request.data.get('duration', 'few_days')
    location = request.data.get('location', 'rural India')

    if not symptoms_text.strip():
        return Response({'error': 'Symptoms required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Gemini prompt for Hindi/English symptoms -> conditions
    prompt = f"""
    Analyze these symptoms for a rural India health triage app.
    Symptoms: "{symptoms_text}"
    Severity: {severity}
    Duration: {duration}
    Location: {location}
    Language: {language}

    Return only valid JSON:
    {{
      "possible_diseases": [
        {{"name": "condition", "probability": 70, "urgency": "low|medium|high", "description": "short explanation", "remedies": ["safe home-care step"]}}
      ],
      "advice": "brief doctor/clinic advice",
      "urgency": "low|medium|high"
    }}
    Include common rural India conditions such as malaria, dengue, typhoid, cholera, anemia, UTI, respiratory infection, and TB when relevant.
    """
    
    try:
        if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY in PLACEHOLDER_KEYS:
            raise RuntimeError('Missing Gemini API key')
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt, request_options={'timeout': 12})
        raw_text = response.text.strip()
        json_match = re.search(r'\{.*\}', raw_text, re.DOTALL)
        analysis = json.loads(json_match.group(0) if json_match else raw_text)
    except Exception:
        analysis = fallback_analysis(symptoms_text, severity, duration)
    
    submission = SymptomSubmission.objects.create(
        user=request.user if request.user.is_authenticated else None,
        symptoms_text=symptoms_text,
        language=language,
        conditions=[item.get('name') for item in analysis.get('possible_diseases', [])],
        urgency=analysis.get('urgency', 'low')
    )
    
    serializer = SymptomSubmissionSerializer(submission)
    return Response({
        'submission': serializer.data,
        'possible_diseases': analysis.get('possible_diseases', []),
        'conditions': serializer.data['conditions'],
        'urgency': serializer.data['urgency'],
        'advice': analysis.get('advice', '')
    })


def fallback_analysis(symptoms_text, severity, duration):
    text = symptoms_text.lower()
    diseases = []

    if any(word in text for word in ['fever', 'bukhar', 'बुखार', 'headache', 'vomit', 'dengue', 'malaria']):
        diseases.append({
            'name': 'Malaria or Dengue-like fever',
            'probability': 68,
            'urgency': 'high' if severity == 'severe' else 'medium',
            'description': 'Fever with headache or vomiting can need testing for malaria, dengue, or viral fever.',
            'remedies': ['Drink ORS/water', 'Use paracetamol if suitable', 'Visit PHC for malaria/dengue test'],
        })
    if any(word in text for word in ['cough', 'breath', 'khansi', 'खांसी', 'tb']):
        diseases.append({
            'name': 'Respiratory infection',
            'probability': 61,
            'urgency': 'high' if 'breath' in text or severity == 'severe' else 'medium',
            'description': 'Cough or breathing difficulty should be checked, especially if it lasts more than two weeks.',
            'remedies': ['Avoid smoke/dust', 'Wear a mask around others', 'Consult a doctor if breathless or persistent'],
        })
    if any(word in text for word in ['stomach', 'loose', 'diarrhea', 'dast', 'दस्त', 'pain']):
        diseases.append({
            'name': 'Gastroenteritis or Typhoid',
            'probability': 58,
            'urgency': 'medium',
            'description': 'Stomach pain and loose motions can cause dehydration and may need stool/blood tests.',
            'remedies': ['Take ORS frequently', 'Eat light food', 'Seek care for blood in stool, high fever, or dehydration'],
        })
    if not diseases:
        diseases.append({
            'name': 'General medical evaluation needed',
            'probability': 50,
            'urgency': 'high' if severity == 'severe' else 'low',
            'description': 'The symptoms need a clinician review for a safer diagnosis.',
            'remedies': ['Rest and hydrate', 'Track temperature and symptoms', 'Visit the nearest clinic if symptoms worsen'],
        })

    urgency = 'high' if any(item['urgency'] == 'high' for item in diseases) else diseases[0]['urgency']
    return {
        'possible_diseases': diseases,
        'urgency': urgency,
        'advice': 'This is AI triage, not a final diagnosis. Please visit the nearest clinic urgently for severe symptoms, breathing difficulty, chest pain, dehydration, pregnancy concerns, or symptoms lasting many days.',
    }
