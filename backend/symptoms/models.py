from django.db import models
from users.models import User

class SymptomSubmission(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    symptoms_text = models.TextField()
    language = models.CharField(max_length=10, default='en')
    conditions = models.JSONField(default=list)
    urgency = models.CharField(max_length=20, default='low')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.symptoms_text[:50]}"
