import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointmentsAPI, hospitalsAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../App';

// BUG FIX: moved BEFORE export default
const to24Hour = (slot) => {
  const [time, suffix] = slot.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (suffix === 'PM' && hours !== 12) hours += 12;
  if (suffix === 'AM' && hours === 12) hours = 0;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const AppointmentBooker = () => {
  const [formData, setFormData] = useState({
    clinic: '',
    date: '',
    time: '',
    symptoms: '',
    preferredDoctor: '',
    smsReminder: true,
  });
  const [availableSlots] = useState([
    '09:00 AM', '10:00 AM', '11:00 AM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
  ]);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { lang } = useLang();

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    loadNearbyClinics();
  }, [user, navigate]);

  const loadNearbyClinics = async () => {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          try {
            const res = await hospitalsAPI.nearest({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            setClinics(res.data);
          } catch { setClinics([]); }
        }, async () => {
          try {
            const res = await hospitalsAPI.list({ limit: 10, available: true });
            setClinics(res.data);
          } catch { setClinics([]); }
        });
      } else {
        const res = await hospitalsAPI.list({ limit: 10 });
        setClinics(res.data);
      }
    } catch { setClinics([]); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.clinic) { setError(lang === 'hi' ? 'क्लिनिक चुनें' : 'Please select a clinic'); return; }
    if (!formData.date)   { setError(lang === 'hi' ? 'तारीख चुनें' : 'Please select a date'); return; }
    if (!formData.time)   { setError(lang === 'hi' ? 'समय चुनें' : 'Please select a time slot'); return; }

    setLoading(true);
    setError('');
    try {
      const payload = {
        clinic_id: formData.clinic,
        appointment_date: `${formData.date}T${to24Hour(formData.time)}:00`,
        notes: formData.symptoms,
        patient: user.id,
        status: 'confirmed',
      };
      const res = await appointmentsAPI.book(payload);
      const selectedClinic = clinics.find((c) => String(c.id) === String(formData.clinic));
      setSuccess({
        id: res.data.id,
        clinic: selectedClinic?.name || 'Selected Clinic',
        date: formData.date,
        time: formData.time,
      });
    } catch (err) {
      setError(lang === 'hi'
        ? 'बुकिंग विफल रही। दोबारा कोशिश करें।'
        : 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date().toISOString().split('T')[0];

  if (success) {
    return (
      <div className="max-w-lg mx-auto animate-fade-in-up">
        <div className="panel p-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl">✅</div>
          <h2 className="heading-md mb-2">
            {lang === 'hi' ? 'अपॉइंटमेंट बुक हो गई!' : 'Appointment Booked!'}
          </h2>
          <p className="body-sm mb-6">
            {lang === 'hi' ? 'आपकी बुकिंग की पुष्टि हो गई है।' : 'Your appointment has been confirmed.'}
          </p>

          <div className="mb-6 rounded-xl bg-green-50 border border-green-200 p-5 text-left space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{lang === 'hi' ? 'क्लिनिक:' : 'Clinic:'}</span>
              <span className="font-semibold text-slate-900">{success.clinic}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{lang === 'hi' ? 'तारीख:' : 'Date:'}</span>
              <span className="font-semibold text-slate-900">
                {new Date(success.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{lang === 'hi' ? 'समय:' : 'Time:'}</span>
              <span className="font-semibold text-slate-900">{success.time}</span>
            </div>
            {success.id && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">{lang === 'hi' ? 'बुकिंग ID:' : 'Booking ID:'}</span>
                <span className="font-semibold text-teal-700">#{success.id}</span>
              </div>
            )}
          </div>

          <div className="alert-info mb-6">
            <span>ℹ️</span>
            <p className="text-sm">
              {lang === 'hi'
                ? 'आधार/स्वास्थ्य कार्ड साथ लाएं। 15 मिनट पहले पहुंचें।'
                : 'Bring Aadhar/health card. Arrive 15 minutes early.'}
            </p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setSuccess(null)} className="btn-secondary flex-1">
              {lang === 'hi' ? 'और बुक करें' : 'Book Another'}
            </button>
            <button onClick={() => navigate('/dashboard')} className="btn-primary flex-1">
              {lang === 'hi' ? 'डैशबोर्ड देखें' : 'View Dashboard'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto animate-fade-in-up">
      <div className="panel p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Clinic selection */}
          <div>
            <label className="label">
              {lang === 'hi' ? 'क्लिनिक चुनें' : 'Select Clinic'}
            </label>
            <select
              value={formData.clinic}
              onChange={(e) => setFormData({ ...formData, clinic: e.target.value })}
              className="field"
            >
              <option value="">{lang === 'hi' ? '-- क्लिनिक चुनें --' : '-- Choose a clinic --'}</option>
              {clinics.length === 0 && (
                <option disabled>{lang === 'hi' ? 'लोड हो रहा है...' : 'Loading clinics...'}</option>
              )}
              {clinics.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.district || c.address}
                  {c.distance ? ` (${typeof c.distance === 'number' ? `${c.distance.toFixed(1)} km` : c.distance})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">{lang === 'hi' ? 'तारीख' : 'Date'}</label>
              <input
                type="date"
                value={formData.date}
                min={minDate}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="field"
                required
              />
            </div>
            <div>
              <label className="label">{lang === 'hi' ? 'समय स्लॉट' : 'Time Slot'}</label>
              <select
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="field"
                required
              >
                <option value="">{lang === 'hi' ? 'समय चुनें' : 'Select time'}</option>
                {availableSlots.map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Symptoms */}
          <div>
            <label className="label">
              {lang === 'hi' ? 'लक्षण (वैकल्पिक)' : 'Current Symptoms (optional)'}
            </label>
            <textarea
              value={formData.symptoms}
              onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
              rows={3}
              placeholder={lang === 'hi'
                ? 'अपने लक्षण यहाँ लिखें...'
                : 'Describe your current symptoms...'}
              className="field resize-none"
            />
          </div>

          {/* Preferred Doctor */}
          <div>
            <label className="label">
              {lang === 'hi' ? 'पसंदीदा डॉक्टर (वैकल्पिक)' : 'Preferred Doctor (optional)'}
            </label>
            <input
              type="text"
              value={formData.preferredDoctor}
              onChange={(e) => setFormData({ ...formData, preferredDoctor: e.target.value })}
              placeholder={lang === 'hi' ? 'डॉक्टर का नाम' : 'Doctor name'}
              className="field"
            />
          </div>

          {/* SMS Reminder Toggle */}
          <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 cursor-pointer hover:bg-slate-50 transition">
            <input
              type="checkbox"
              checked={formData.smsReminder}
              onChange={(e) => setFormData({ ...formData, smsReminder: e.target.checked })}
              className="h-4 w-4 rounded text-teal-600"
            />
            <div>
              <p className="text-sm font-semibold text-slate-800">
                📱 {lang === 'hi' ? 'SMS रिमाइंडर' : 'SMS Reminder'}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {lang === 'hi'
                  ? 'अपॉइंटमेंट से 1 घंटे पहले याद दिलाएं'
                  : 'Get reminded 1 hour before your appointment'}
              </p>
            </div>
          </label>

          {error && (
            <div className="alert-emergency">
              <span>⚠️</span>
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base">
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {lang === 'hi' ? 'बुक हो रहा है...' : 'Booking...'}
              </>
            ) : (
              <>📅 {lang === 'hi' ? 'अपॉइंटमेंट कन्फर्म करें' : 'Confirm & Book Appointment'}</>
            )}
          </button>
        </form>
      </div>

      {/* Info box */}
      <div className="alert-info mt-4">
        <span>ℹ️</span>
        <div className="text-sm">
          <p className="font-semibold mb-1">{lang === 'hi' ? 'बुकिंग से पहले जानें:' : 'Before Booking:'}</p>
          <ul className="space-y-1">
            <li>• {lang === 'hi' ? 'आधार कार्ड/स्वास्थ्य कार्ड साथ लाएं' : 'Bring Aadhar/health card'}</li>
            <li>• {lang === 'hi' ? '15 मिनट पहले पहुंचें' : 'Arrive 15 minutes early'}</li>
            <li>• {lang === 'hi' ? 'रद्द करने के लिए 2 घंटे पहले सूचित करें' : 'Cancel 2 hours before via app'}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AppointmentBooker;
