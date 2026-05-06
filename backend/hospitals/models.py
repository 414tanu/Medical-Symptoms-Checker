from django.db import models

CLINIC_TYPES = [
    ('PHC', 'Primary Health Centre'),
    ('CHC', 'Community Health Centre'),
    ('District Hospital', 'District Hospital'),
    ('Sub-District Hospital', 'Sub-District Hospital'),
    ('Private Clinic', 'Private Clinic'),
]

class Clinic(models.Model):
    name = models.CharField(max_length=200)
    address = models.TextField(blank=True)
    lat = models.FloatField()
    lng = models.FloatField()
    phone = models.CharField(max_length=20, default='104')
    district = models.CharField(max_length=100)
    state = models.CharField(max_length=100, default='Bihar')
    pincode = models.CharField(max_length=10, blank=True)
    type = models.CharField(max_length=30, choices=CLINIC_TYPES, default='PHC')
    services = models.JSONField(default=list, blank=True)
    is_govt = models.BooleanField(default=True)
    verified = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.district})"

