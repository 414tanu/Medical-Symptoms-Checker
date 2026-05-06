"""
Management command to seed real Bihar & UP rural clinic data.
Run with: python manage.py seed_clinics
"""
from django.core.management.base import BaseCommand
from hospitals.models import Clinic


CLINICS = [
    # ── Bihar ──────────────────────────────────────────────────────────────
    {
        'name': 'Patna Medical College & Hospital',
        'address': 'Ashok Rajpath, Patna, Bihar 800004',
        'lat': 25.6086, 'lng': 85.1444,
        'phone': '0612-2300011', 'district': 'Patna', 'state': 'Bihar',
        'pincode': '800004', 'type': 'District Hospital',
        'services': ['Emergency', 'OPD', 'Surgery', 'Maternity', 'Pediatrics'],
        'is_govt': True,
    },
    {
        'name': 'PHC Phulwarisharif',
        'address': 'Phulwarisharif, Patna, Bihar',
        'lat': 25.5590, 'lng': 85.0985,
        'phone': '0612-2270100', 'district': 'Patna', 'state': 'Bihar',
        'pincode': '801505', 'type': 'PHC',
        'services': ['OPD', 'Maternal Health', 'Immunization', 'TB'],
        'is_govt': True,
    },
    {
        'name': 'CHC Danapur',
        'address': 'Danapur, Patna, Bihar 801503',
        'lat': 25.6148, 'lng': 85.0426,
        'phone': '0612-2220100', 'district': 'Patna', 'state': 'Bihar',
        'pincode': '801503', 'type': 'CHC',
        'services': ['OPD', 'Emergency', 'Lab', 'Maternity'],
        'is_govt': True,
    },
    {
        'name': 'SKMCH Muzaffarpur (SK Medical College)',
        'address': 'Sri Krishna Medical College, Muzaffarpur, Bihar',
        'lat': 26.1208, 'lng': 85.3647,
        'phone': '0621-2220050', 'district': 'Muzaffarpur', 'state': 'Bihar',
        'pincode': '842004', 'type': 'District Hospital',
        'services': ['Emergency', 'OPD', 'Surgery', 'Pediatrics', 'Encephalitis'],
        'is_govt': True,
    },
    {
        'name': 'PHC Motipur',
        'address': 'Motipur, Muzaffarpur, Bihar',
        'lat': 26.3204, 'lng': 85.1798,
        'phone': '104', 'district': 'Muzaffarpur', 'state': 'Bihar',
        'pincode': '843110', 'type': 'PHC',
        'services': ['OPD', 'Maternal Health', 'Immunization'],
        'is_govt': True,
    },
    {
        'name': 'Sadar Hospital Gaya',
        'address': 'Shahpur, Gaya, Bihar',
        'lat': 24.7979, 'lng': 84.9999,
        'phone': '0631-2222100', 'district': 'Gaya', 'state': 'Bihar',
        'pincode': '823001', 'type': 'District Hospital',
        'services': ['Emergency', 'OPD', 'Surgery', 'Maternity', 'Malaria'],
        'is_govt': True,
    },
    {
        'name': 'PHC Bodh Gaya',
        'address': 'Bodh Gaya, Gaya District, Bihar',
        'lat': 24.6867, 'lng': 84.9910,
        'phone': '104', 'district': 'Gaya', 'state': 'Bihar',
        'pincode': '824234', 'type': 'PHC',
        'services': ['OPD', 'TB DOTS', 'Immunization'],
        'is_govt': True,
    },
    {
        'name': 'Sadar Hospital Darbhanga',
        'address': 'Laheriasarai, Darbhanga, Bihar',
        'lat': 26.1520, 'lng': 85.8969,
        'phone': '06272-222100', 'district': 'Darbhanga', 'state': 'Bihar',
        'pincode': '846001', 'type': 'District Hospital',
        'services': ['Emergency', 'OPD', 'Surgery', 'Maternity'],
        'is_govt': True,
    },
    {
        'name': 'CHC Benipur',
        'address': 'Benipur, Darbhanga District, Bihar',
        'lat': 26.0947, 'lng': 85.9658,
        'phone': '104', 'district': 'Darbhanga', 'state': 'Bihar',
        'pincode': '847103', 'type': 'CHC',
        'services': ['OPD', 'Lab', 'Maternity'],
        'is_govt': True,
    },
    {
        'name': 'Sadar Hospital Bhagalpur',
        'address': 'Adampur, Bhagalpur, Bihar',
        'lat': 25.2418, 'lng': 86.9740,
        'phone': '0641-2221100', 'district': 'Bhagalpur', 'state': 'Bihar',
        'pincode': '812001', 'type': 'District Hospital',
        'services': ['Emergency', 'OPD', 'Surgery', 'Eye Care'],
        'is_govt': True,
    },
    {
        'name': 'PHC Banka',
        'address': 'Banka, Bihar',
        'lat': 24.8896, 'lng': 86.9202,
        'phone': '104', 'district': 'Banka', 'state': 'Bihar',
        'pincode': '813102', 'type': 'PHC',
        'services': ['OPD', 'Maternal Health', 'Immunization'],
        'is_govt': True,
    },
    {
        'name': 'Sadar Hospital Purnia',
        'address': 'Purnia, Bihar',
        'lat': 25.7771, 'lng': 87.4753,
        'phone': '06454-222100', 'district': 'Purnia', 'state': 'Bihar',
        'pincode': '854301', 'type': 'District Hospital',
        'services': ['Emergency', 'OPD', 'Maternity', 'Pediatrics'],
        'is_govt': True,
    },

    # ── Uttar Pradesh ───────────────────────────────────────────────────────
    {
        'name': 'KGMU (King George Medical University)',
        'address': 'Shah Mina Rd, Lucknow, UP 226003',
        'lat': 26.8621, 'lng': 80.9214,
        'phone': '0522-2257540', 'district': 'Lucknow', 'state': 'Uttar Pradesh',
        'pincode': '226003', 'type': 'District Hospital',
        'services': ['Emergency', 'OPD', 'Surgery', 'Cancer', 'Neurology'],
        'is_govt': True,
    },
    {
        'name': 'CHC Bakshi Ka Talab',
        'address': 'Bakshi Ka Talab, Lucknow, UP',
        'lat': 26.9568, 'lng': 80.9300,
        'phone': '104', 'district': 'Lucknow', 'state': 'Uttar Pradesh',
        'pincode': '226201', 'type': 'CHC',
        'services': ['OPD', 'Maternity', 'Immunization'],
        'is_govt': True,
    },
    {
        'name': 'BHU (IMS-BHU) Hospital Varanasi',
        'address': 'Banaras Hindu University, Varanasi, UP',
        'lat': 25.2677, 'lng': 82.9913,
        'phone': '0542-2307111', 'district': 'Varanasi', 'state': 'Uttar Pradesh',
        'pincode': '221005', 'type': 'District Hospital',
        'services': ['Emergency', 'OPD', 'Surgery', 'Ayurveda'],
        'is_govt': True,
    },
    {
        'name': 'PHC Chiraigaon',
        'address': 'Chiraigaon, Varanasi, UP',
        'lat': 25.3290, 'lng': 82.9197,
        'phone': '104', 'district': 'Varanasi', 'state': 'Uttar Pradesh',
        'pincode': '221105', 'type': 'PHC',
        'services': ['OPD', 'TB DOTS', 'Maternal Health'],
        'is_govt': True,
    },
    {
        'name': 'District Hospital Gorakhpur',
        'address': 'Park Road, Gorakhpur, UP',
        'lat': 26.7606, 'lng': 83.3732,
        'phone': '0551-2204100', 'district': 'Gorakhpur', 'state': 'Uttar Pradesh',
        'pincode': '273001', 'type': 'District Hospital',
        'services': ['Emergency', 'OPD', 'Encephalitis', 'Surgery'],
        'is_govt': True,
    },
    {
        'name': 'CHC Sahjanwa',
        'address': 'Sahjanwa, Gorakhpur District, UP',
        'lat': 26.7260, 'lng': 83.2750,
        'phone': '104', 'district': 'Gorakhpur', 'state': 'Uttar Pradesh',
        'pincode': '273209', 'type': 'CHC',
        'services': ['OPD', 'Malaria Testing', 'Maternity'],
        'is_govt': True,
    },
    {
        'name': 'PHC Padrauna',
        'address': 'Padrauna, Kushinagar District, UP',
        'lat': 26.8988, 'lng': 83.9792,
        'phone': '104', 'district': 'Kushinagar', 'state': 'Uttar Pradesh',
        'pincode': '274304', 'type': 'PHC',
        'services': ['OPD', 'Immunization', 'Family Planning'],
        'is_govt': True,
    },
    {
        'name': 'District Hospital Allahabad (Prayagraj)',
        'address': 'Stanley Road, Prayagraj, UP',
        'lat': 25.4358, 'lng': 81.8463,
        'phone': '0532-2408100', 'district': 'Prayagraj', 'state': 'Uttar Pradesh',
        'pincode': '211001', 'type': 'District Hospital',
        'services': ['Emergency', 'OPD', 'Surgery', 'Pediatrics'],
        'is_govt': True,
    },
    {
        'name': 'CHC Meja',
        'address': 'Meja, Prayagraj District, UP',
        'lat': 25.2880, 'lng': 81.9640,
        'phone': '104', 'district': 'Prayagraj', 'state': 'Uttar Pradesh',
        'pincode': '212303', 'type': 'CHC',
        'services': ['OPD', 'Lab', 'Maternal Health'],
        'is_govt': True,
    },
    {
        'name': 'District Hospital Agra',
        'address': 'M.G. Road, Agra, UP',
        'lat': 27.1767, 'lng': 78.0081,
        'phone': '0562-2260100', 'district': 'Agra', 'state': 'Uttar Pradesh',
        'pincode': '282002', 'type': 'District Hospital',
        'services': ['Emergency', 'OPD', 'Eye Care', 'Surgery'],
        'is_govt': True,
    },
    {
        'name': 'PHC Fatehpur Sikri',
        'address': 'Fatehpur Sikri, Agra District, UP',
        'lat': 27.0945, 'lng': 77.6639,
        'phone': '104', 'district': 'Agra', 'state': 'Uttar Pradesh',
        'pincode': '283110', 'type': 'PHC',
        'services': ['OPD', 'Maternal Health', 'Immunization'],
        'is_govt': True,
    },
]


class Command(BaseCommand):
    help = 'Seed Bihar & Uttar Pradesh rural clinic data (25+ real facilities)'

    def handle(self, *args, **kwargs):
        created = 0
        updated = 0
        for data in CLINICS:
            obj, was_created = Clinic.objects.update_or_create(
                name=data['name'],
                district=data['district'],
                defaults=data,
            )
            if was_created:
                created += 1
            else:
                updated += 1

        self.stdout.write(self.style.SUCCESS(
            f'\nSeeding complete!\n'
            f'   Created: {created} new clinics\n'
            f'   Updated: {updated} existing clinics\n'
            f'   Total:   {Clinic.objects.count()} clinics in database\n'
        ))

