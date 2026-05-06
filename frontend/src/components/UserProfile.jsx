import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../App';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const { lang } = useLang();
  const [form, setForm] = useState({
    name: '', age: '', gender: '', village: '', district: '',
    state: 'Bihar', bloodGroup: 'Unknown', allergies: '', emergencyContact: '',
  });
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('userProfile') || '{}');
    setForm((prev) => ({
      ...prev,
      name: user?.name || stored.name || '',
      ...stored,
    }));
  }, [user]);

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('userProfile', JSON.stringify(form));
    if (updateUser) updateUser({ name: form.name });
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const states = [
    'Bihar', 'Uttar Pradesh', 'Jharkhand', 'West Bengal',
    'Rajasthan', 'Madhya Pradesh', 'Maharashtra', 'Other'
  ];

  const genders = [
    { value: 'male',   en: 'Male',   hi: 'पुरुष' },
    { value: 'female', en: 'Female', hi: 'महिला' },
    { value: 'other',  en: 'Other',  hi: 'अन्य' },
  ];

  const Field = ({ label, children }) => (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );

  return (
    <div className="soft-page py-10 px-4">
      <div className="max-w-xl mx-auto space-y-5">
        <Link
          to="/home"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {lang === 'hi' ? 'होम पर जाएं' : 'Back to Home'}
        </Link>

        {/* Avatar Card */}
        <div className="panel-glass p-6 flex items-center gap-5 animate-fade-in-up">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-white text-3xl font-bold"
            style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}>
            {(form.name || user?.phone || 'U')[0].toUpperCase()}
          </div>
          <div>
            <h1 className="heading-md">{form.name || (lang === 'hi' ? 'आपका नाम' : 'Your Name')}</h1>
            <p className="body-sm mt-1">{user?.phone || ''}</p>
            {form.bloodGroup && form.bloodGroup !== 'Unknown' && (
              <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                🩸 {lang === 'hi' ? 'रक्त समूह:' : 'Blood Group:'} {form.bloodGroup}
              </span>
            )}
          </div>
        </div>

        {saved && (
          <div className="alert-success animate-fade-in-up">
            <span>✅</span>
            <p className="font-semibold text-sm">
              {lang === 'hi' ? 'प्रोफाइल सेव हो गई!' : 'Profile saved successfully!'}
            </p>
          </div>
        )}

        <div className="panel p-6 animate-fade-in-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className="heading-md">
              {lang === 'hi' ? 'व्यक्तिगत जानकारी' : 'Personal Information'}
            </h2>
            {!editing && (
              <button onClick={() => setEditing(true)} className="btn-secondary text-sm px-4 py-2">
                ✏️ {lang === 'hi' ? 'संपादित करें' : 'Edit'}
              </button>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {/* Read-only display when not editing */}
            {!editing ? (
              <div className="space-y-3">
                {[
                  { label: lang === 'hi' ? 'पूरा नाम' : 'Full Name', value: form.name },
                  { label: lang === 'hi' ? 'उम्र' : 'Age', value: form.age ? `${form.age} years` : '' },
                  { label: lang === 'hi' ? 'लिंग' : 'Gender', value: form.gender },
                  { label: lang === 'hi' ? 'गाँव/मोहल्ला' : 'Village/Locality', value: form.village },
                  { label: lang === 'hi' ? 'जिला' : 'District', value: form.district },
                  { label: lang === 'hi' ? 'राज्य' : 'State', value: form.state },
                  { label: lang === 'hi' ? 'रक्त समूह' : 'Blood Group', value: form.bloodGroup },
                  { label: lang === 'hi' ? 'एलर्जी' : 'Allergies', value: form.allergies },
                  { label: lang === 'hi' ? 'आपातकाल संपर्क' : 'Emergency Contact', value: form.emergencyContact },
                ].map((row) => (
                  <div key={row.label} className="flex gap-4 py-2.5 border-b border-slate-100 last:border-0">
                    <span className="w-40 shrink-0 text-sm text-slate-500">{row.label}</span>
                    <span className="text-sm font-medium text-slate-900">{row.value || '—'}</span>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label={lang === 'hi' ? 'पूरा नाम *' : 'Full Name *'}>
                    <input
                      type="text" value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="field" placeholder={lang === 'hi' ? 'आपका नाम' : 'Your full name'}
                    />
                  </Field>
                  <Field label={lang === 'hi' ? 'उम्र' : 'Age'}>
                    <input
                      type="number" value={form.age} min={0} max={120}
                      onChange={(e) => setForm({ ...form, age: e.target.value })}
                      className="field" placeholder="e.g., 35"
                    />
                  </Field>
                </div>

                <Field label={lang === 'hi' ? 'लिंग' : 'Gender'}>
                  <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="field">
                    <option value="">{lang === 'hi' ? '-- चुनें --' : '-- Select --'}</option>
                    {genders.map((g) => <option key={g.value} value={g.value}>{lang === 'hi' ? g.hi : g.en}</option>)}
                  </select>
                </Field>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label={lang === 'hi' ? 'गाँव/मोहल्ला' : 'Village/Locality'}>
                    <input
                      type="text" value={form.village}
                      onChange={(e) => setForm({ ...form, village: e.target.value })}
                      className="field" placeholder={lang === 'hi' ? 'गाँव का नाम' : 'Village name'}
                    />
                  </Field>
                  <Field label={lang === 'hi' ? 'जिला' : 'District'}>
                    <input
                      type="text" value={form.district}
                      onChange={(e) => setForm({ ...form, district: e.target.value })}
                      className="field" placeholder={lang === 'hi' ? 'जिला' : 'District'}
                    />
                  </Field>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label={lang === 'hi' ? 'राज्य' : 'State'}>
                    <select value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="field">
                      {states.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </Field>
                  <Field label={lang === 'hi' ? 'रक्त समूह' : 'Blood Group'}>
                    <select value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })} className="field">
                      {BLOOD_GROUPS.map((b) => <option key={b}>{b}</option>)}
                    </select>
                  </Field>
                </div>

                <Field label={lang === 'hi' ? 'एलर्जी (यदि कोई हो)' : 'Allergies (if any)'}>
                  <input
                    type="text" value={form.allergies}
                    onChange={(e) => setForm({ ...form, allergies: e.target.value })}
                    className="field"
                    placeholder={lang === 'hi' ? 'जैसे: Penicillin, धूल, मूंगफली...' : 'E.g., Penicillin, dust, peanuts...'}
                  />
                </Field>

                <Field label={lang === 'hi' ? 'आपातकाल संपर्क नंबर' : 'Emergency Contact Number'}>
                  <input
                    type="tel" value={form.emergencyContact}
                    onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
                    className="field" placeholder="+91 98XXXXXXXX"
                  />
                </Field>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setEditing(false)} className="btn-secondary flex-1">
                    {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                  </button>
                  <button type="submit" className="btn-primary flex-1">
                    💾 {lang === 'hi' ? 'सेव करें' : 'Save Profile'}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>

        {/* Info note */}
        <div className="alert-info">
          <span>🔒</span>
          <p className="text-sm">
            {lang === 'hi'
              ? 'आपकी जानकारी सिर्फ आपके डिवाइस पर सुरक्षित रहती है।'
              : 'Your information is stored securely on your device only.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
