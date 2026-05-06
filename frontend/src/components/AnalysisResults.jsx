import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { hospitalsAPI } from '../services/api';
import { useLang } from '../App';

const urgencyConfig = {
  high: {
    label: { en: 'HIGH — See doctor immediately', hi: 'गंभीर — तुरंत डॉक्टर से मिलें' },
    banner: 'bg-red-600',
    badge: 'badge-high',
    border: 'border-l-red-500 bg-red-50',
  },
  medium: {
    label: { en: 'MODERATE — Visit clinic soon', hi: 'मध्यम — जल्द क्लिनिक जाएं' },
    banner: 'bg-amber-500',
    badge: 'badge-medium',
    border: 'border-l-amber-500 bg-amber-50',
  },
  low: {
    label: { en: 'LOW — Monitor at home', hi: 'हल्का — घर पर देखें' },
    banner: 'bg-green-600',
    badge: 'badge-low',
    border: 'border-l-green-500 bg-green-50',
  },
};

const AnalysisResults = () => {
  const [results, setResults] = useState(null);
  const [nearbyClinics, setNearbyClinics] = useState([]);
  const [clinicLoading, setClinicsLoading] = useState(true);
  const navigate = useNavigate();
  const { lang } = useLang();

  useEffect(() => {
    const stored = localStorage.getItem('analysisResults');
    if (!stored) { navigate('/symptoms'); return; }
    setResults(JSON.parse(stored));

    const location = localStorage.getItem('userLocation') || 'Patna, Bihar';
    loadClinics(location);
  }, [navigate]);

  const loadClinics = async (location) => {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              const res = await hospitalsAPI.nearest({ lat: pos.coords.latitude, lng: pos.coords.longitude });
              setNearbyClinics(res.data.slice(0, 5));
            } catch { /* skip */ }
            setClinicsLoading(false);
          },
          async () => {
            try {
              const res = await hospitalsAPI.list({ location, state: 'Bihar' });
              setNearbyClinics(res.data.slice(0, 5));
            } catch { /* skip */ }
            setClinicsLoading(false);
          }
        );
      } else {
        setClinicsLoading(false);
      }
    } catch {
      setClinicsLoading(false);
    }
  };

  if (!results) return (
    <div className="soft-page flex items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" />
    </div>
  );

  const urgency = results?.urgency || 'low';
  const cfg = urgencyConfig[urgency] || urgencyConfig.low;
  const diseases = results?.possible_diseases || [];
  const advice = results?.advice || '';

  return (
    <div className="soft-page py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          to="/home"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {lang === 'hi' ? 'होम पर जाएं' : 'Back to Home'}
        </Link>

        {/* Header */}
        <div className="text-center animate-fade-in-up">
          <h1 className="heading-lg">
            {lang === 'hi' ? 'AI जांच परिणाम' : 'AI Analysis Results'}
          </h1>
          <p className="body-sm mt-2">
            {lang === 'hi'
              ? '⚕️ यह AI सहायता है। कृपया पुष्टि के लिए डॉक्टर से मिलें।'
              : '⚕️ AI-assisted triage only. Please consult a doctor for confirmation.'}
          </p>
        </div>

        {/* Urgency Banner */}
        <div className={`rounded-2xl text-white p-5 flex items-center gap-4 ${cfg.banner} animate-fade-in-up`}>
          <div className="text-4xl">
            {urgency === 'high' ? '🚨' : urgency === 'medium' ? '⚠️' : '✅'}
          </div>
          <div className="flex-1">
            <p className="font-bold text-lg">{cfg.label[lang] || cfg.label.en}</p>
            {urgency === 'high' && (
              <p className="text-sm mt-1 opacity-90">
                {lang === 'hi'
                  ? 'कृपया नीचे दिए बटन से तुरंत कॉल करें'
                  : 'Please use the emergency buttons below to call now'}
              </p>
            )}
          </div>
          <span className={`inline-flex rounded-full bg-white/20 px-4 py-1.5 text-sm font-bold uppercase`}>
            {urgency}
          </span>
        </div>

        {/* Emergency Call Buttons (shown when high urgency) */}
        {urgency === 'high' && (
          <div className="alert-emergency animate-fade-in-up">
            <span className="text-2xl">🚨</span>
            <div className="flex-1">
              <p className="font-bold">
                {lang === 'hi' ? 'तुरंत इलाज ज़रूरी है!' : 'Immediate medical care needed!'}
              </p>
              <p className="text-sm mt-0.5">
                {lang === 'hi'
                  ? 'नजदीकी अस्पताल जाएं या एम्बुलेंस बुलाएं'
                  : 'Go to nearest hospital or call ambulance'}
              </p>
            </div>
            <div className="flex gap-2 shrink-0 flex-col">
              <a href="tel:108" className="btn-emergency text-sm px-3 py-2">📞 108 Ambulance</a>
              <a href="tel:104" className="rounded-xl border-2 border-red-300 bg-white px-3 py-2 text-center text-sm font-bold text-red-700 hover:bg-red-50">📞 104 Health</a>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Conditions — 3 cols */}
          <div className="lg:col-span-3 space-y-4">
            <h2 className="heading-md">
              {lang === 'hi' ? 'संभावित बीमारियां' : 'Possible Conditions'}
            </h2>
            {diseases.length === 0 && (
              <div className="panel p-6 text-center text-slate-500">
                {lang === 'hi' ? 'कोई परिणाम नहीं' : 'No conditions identified'}
              </div>
            )}
            {diseases.map((disease, i) => {
              const dCfg = urgencyConfig[disease.urgency] || urgencyConfig.low;
              return (
                <div key={i} className={`rounded-2xl border-l-4 p-5 ${dCfg.border} animate-fade-in-up`} style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-slate-900 text-base pr-2">{disease.name}</h3>
                    <span className={dCfg.badge}>{disease.urgency?.toUpperCase()}</span>
                  </div>

                  {/* Probability bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>{lang === 'hi' ? 'संभावना' : 'Probability'}</span>
                      <span className="font-semibold">{disease.probability}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-200">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${disease.urgency === 'high' ? 'bg-red-500' : disease.urgency === 'medium' ? 'bg-amber-400' : 'bg-green-500'}`}
                        style={{ width: `${disease.probability}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed">{disease.description}</p>

                  {disease.remedies && disease.remedies.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        {lang === 'hi' ? 'घरेलू देखभाल:' : 'Home Care:'}
                      </p>
                      {disease.remedies.map((remedy, j) => (
                        <div key={j} className="flex items-start gap-2 text-sm text-slate-700">
                          <span className="mt-0.5 text-green-500 shrink-0">✓</span>
                          <span>{remedy}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Doctor Advice Box */}
            {advice && (
              <div className="alert-info animate-fade-in-up">
                <span className="text-xl shrink-0">👨‍⚕️</span>
                <div>
                  <p className="font-semibold text-sm mb-1">
                    {lang === 'hi' ? 'डॉक्टर की सलाह:' : 'Medical Advice:'}
                  </p>
                  <p className="text-sm leading-relaxed">{advice}</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Cards — 2 cols */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="heading-md">
              {lang === 'hi' ? 'अगला कदम' : 'Next Steps'}
            </h2>

            <Link to="/hospitals" className="panel p-5 block hover:border-teal-300 hover:shadow-md transition-all group">
              <div className="flex items-start gap-3">
                <div className="text-3xl">🏥</div>
                <div>
                  <h3 className="font-bold text-slate-900 group-hover:text-teal-700 transition">
                    {lang === 'hi' ? 'नजदीकी क्लिनिक खोजें' : 'Find Nearby Clinics'}
                  </h3>
                  <p className="body-sm mt-1">
                    {lang === 'hi' ? 'PHC, CHC और अस्पताल मैप पर देखें' : 'PHCs, CHCs & hospitals on map'}
                  </p>
                  <span className="mt-2 inline-block text-teal-600 font-semibold text-sm">
                    {lang === 'hi' ? 'मैप देखें →' : 'View Map →'}
                  </span>
                </div>
              </div>
            </Link>

            <Link to="/appointments" className="panel p-5 block hover:border-green-300 hover:shadow-md transition-all group">
              <div className="flex items-start gap-3">
                <div className="text-3xl">📅</div>
                <div>
                  <h3 className="font-bold text-slate-900 group-hover:text-green-700 transition">
                    {lang === 'hi' ? 'अपॉइंटमेंट बुक करें' : 'Book Appointment'}
                  </h3>
                  <p className="body-sm mt-1">
                    {lang === 'hi' ? 'डॉक्टर से मिलने का समय' : 'Schedule a clinic visit'}
                  </p>
                  <span className="mt-2 inline-block text-green-600 font-semibold text-sm">
                    {lang === 'hi' ? 'अभी बुक करें →' : 'Book Now →'}
                  </span>
                </div>
              </div>
            </Link>

            <Link to="/reminders" className="panel p-5 block hover:border-amber-300 hover:shadow-md transition-all group">
              <div className="flex items-start gap-3">
                <div className="text-3xl">💊</div>
                <div>
                  <h3 className="font-bold text-slate-900 group-hover:text-amber-700 transition">
                    {lang === 'hi' ? 'दवाई रिमाइंडर' : 'Medicine Reminder'}
                  </h3>
                  <p className="body-sm mt-1">
                    {lang === 'hi' ? 'दवाई का अलार्म लगाएं' : 'Set a dose alarm'}
                  </p>
                  <span className="mt-2 inline-block text-amber-600 font-semibold text-sm">
                    {lang === 'hi' ? 'अलार्म लगाएं →' : 'Set Reminder →'}
                  </span>
                </div>
              </div>
            </Link>

            {/* Emergency numbers */}
            <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-5">
              <p className="font-bold text-red-800 mb-3">🚨 {lang === 'hi' ? 'आपातकाल नंबर' : 'Emergency Numbers'}</p>
              <div className="space-y-2">
                {[
                  { num: '108', label: lang === 'hi' ? 'एम्बुलेंस' : 'Ambulance' },
                  { num: '104', label: lang === 'hi' ? 'स्वास्थ्य हेल्पलाइन' : 'Health Helpline' },
                  { num: '112', label: lang === 'hi' ? 'पुलिस' : 'Police' },
                ].map((e) => (
                  <a key={e.num} href={`tel:${e.num}`}
                    className="flex items-center justify-between rounded-xl bg-white px-4 py-2.5 border border-red-200 hover:bg-red-50 transition group">
                    <span className="text-sm font-medium text-slate-700">{e.label}</span>
                    <span className="font-bold text-red-600 group-hover:text-red-700">📞 {e.num}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Nearby Clinics */}
        {!clinicLoading && nearbyClinics.length > 0 && (
          <div className="panel p-6 animate-fade-in-up">
            <h2 className="heading-md mb-4">
              {lang === 'hi' ? '📍 नजदीकी क्लिनिक' : '📍 Nearby Clinics'}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {nearbyClinics.map((c, i) => (
                <div key={i} className="rounded-xl border border-slate-200 p-4 hover:border-teal-300 hover:shadow-sm transition">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-slate-900 text-sm leading-tight pr-2">{c.name}</h4>
                    {c.distance && (
                      <span className="shrink-0 rounded-full bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-700">
                        {typeof c.distance === 'number' ? `${c.distance.toFixed(1)} km` : c.distance}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mb-3">{c.address || c.district}</p>
                  <a href={`tel:${c.phone}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700">
                    📞 {lang === 'hi' ? 'अभी कॉल करें' : 'Call Now'}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Analysis */}
        <div className="text-center pb-8">
          <button
            onClick={() => navigate('/symptoms')}   /* BUG FIX: was navigate('/') */
            className="btn-secondary px-8 py-3"
          >
            ← {lang === 'hi' ? 'नई जांच करें' : 'New Symptom Check'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;
