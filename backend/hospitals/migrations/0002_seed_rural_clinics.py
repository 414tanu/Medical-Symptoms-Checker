from django.db import migrations


CLINICS = [
    ('PHC Phulwari Sharif', 'Phulwari Sharif, Patna, Bihar', 25.5732, 85.0734, '06122551234', 'Patna', '801505'),
    ('Community Health Centre Danapur', 'Danapur, Patna, Bihar', 25.6371, 85.0478, '06115223344', 'Patna', '801503'),
    ('PHC Hajipur Rural', 'Hajipur, Vaishali, Bihar', 25.6924, 85.2083, '06224224411', 'Vaishali', '844101'),
    ('Sadar Hospital Muzaffarpur', 'Muzaffarpur, Bihar', 26.1209, 85.3647, '06212212345', 'Muzaffarpur', '842001'),
    ('PHC Bodh Gaya', 'Bodh Gaya, Gaya, Bihar', 24.6961, 84.9913, '06312201234', 'Gaya', '824231'),
    ('CHC Sarojini Nagar', 'Sarojini Nagar, Lucknow, Uttar Pradesh', 26.7680, 80.9062, '05222441234', 'Lucknow', '226008'),
    ('PHC Barabanki Rural', 'Barabanki, Uttar Pradesh', 26.9345, 81.1893, '05248222111', 'Barabanki', '225001'),
    ('CHC Sarnath', 'Sarnath, Varanasi, Uttar Pradesh', 25.3811, 83.0255, '05422591234', 'Varanasi', '221007'),
]


def seed_clinics(apps, schema_editor):
    Clinic = apps.get_model('hospitals', 'Clinic')
    for name, address, lat, lng, phone, district, pincode in CLINICS:
        Clinic.objects.get_or_create(
            name=name,
            defaults={
                'address': address,
                'lat': lat,
                'lng': lng,
                'phone': phone,
                'district': district,
                'pincode': pincode,
                'verified': True,
            },
        )


class Migration(migrations.Migration):

    dependencies = [
        ('hospitals', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_clinics, migrations.RunPython.noop),
    ]
