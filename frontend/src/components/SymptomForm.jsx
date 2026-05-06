import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../App';
import { symptomsAPI } from '../services/api';

const SymptomForm = () => {
  const [symptoms, setSymptoms] = useState('');
  const [language, setLanguage] = useState('en-IN');
  const [severity, setSeverity] = useState('moderate');
  const [duration, setDuration] = useState('few_days');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { lang } = useLang();

  const languageOptions = [
    { value: 'en-IN', label: 'English', apiLanguage: 'en' },
    { value: 'hi-IN', label: 'हिंदी (Hindi)', apiLanguage: 'hi' },
    { value: 'ta-IN', label: 'தமிழ் (Tamil)', apiLanguage: 'ta' },
    { value: 'te-IN', label: 'తెలుగు (Telugu)', apiLanguage: 'te' },
    { value: 'bn-IN', label: 'বাংলা (Bengali)', apiLanguage: 'bn' },
    { value: 'mr-IN', label: 'मराठी (Marathi)', apiLanguage: 'mr' },
    { value: 'gu-IN', label: 'ગુજરાતી (Gujarati)', apiLanguage: 'gu' },
    { value: 'kn-IN', label: 'ಕನ್ನಡ (Kannada)', apiLanguage: 'kn' },
    { value: 'ml-IN', label: 'മലയാളം (Malayalam)', apiLanguage: 'ml' },
    { value: 'pa-IN', label: 'ਪੰਜਾਬੀ (Punjabi)', apiLanguage: 'pa' },
    { value: 'ur-IN', label: 'اردو (Urdu)', apiLanguage: 'ur' },
  ];

  const selectedLang = languageOptions.find((o) => o.value === language) || languageOptions[0];

  const ruralSymptoms = [
    { en: 'Fever with headache, vomiting', hi: 'बुखार, सिरदर्द, उल्टी' },
    { en: 'Cough, breathlessness (TB/Asthma)', hi: 'खांसी, सांस लेने में दिक्कत' },
    { en: 'Stomach pain, loose motions', hi: 'पेट दर्द, दस्त' },
    { en: 'Skin rashes, itching', hi: 'त्वचा पर दाने, खुजली' },
    { en: 'Joint pain, swelling', hi: 'जोड़ों में दर्द, सूजन' },
    { en: 'Burning urination (UTI)', hi: 'पेशाब में जलन (UTI)' },
    { en: 'Chest pain, palpitations', hi: 'सीने में दर्द, घबराहट' },
    { en: 'Weakness, dizziness (Anemia)', hi: 'कमज़ोरी, चक्कर (एनीमिया)' },
  ];

  const placeholderText = language === 'hi-IN'
    ? 'यहाँ अपने लक्षण लिखें या बोलें। उदाहरण: 3 दिन से बुखार है, सिरदर्द और खांसी है...'
    : `Type or speak symptoms in ${selectedLang.label}. Example: Fever for 3 days, headache, cough...`;

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError(lang === 'hi'
        ? 'आवाज इनपुट इस ब्राउज़र में काम नहीं करता। Chrome या Edge उपयोग करें।'
        : 'Voice input not supported. Please use Chrome or Edge.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => { setListening(true); setError(''); };
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setSymptoms((cur) => `${cur}${cur ? ' ' : ''}${transcript}`);
    };
    recognition.onerror = () => {
      setError(lang === 'hi'
        ? 'माइक्रोफोन की अनुमति दें और दोबारा कोशिश करें।'
        : 'Voice input failed. Allow microphone permission and try again.');
    };
    recognition.onend = () => setListening(false);
    recognition.start();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        symptoms: symptoms.trim(),
        language: selectedLang.apiLanguage,
        severity,
        duration,
        location: location || 'Bihar/UP rural',
        user_id: user?.id || null,
      };
      const response = await symptomsAPI.analyze(payload);
      const analysis = response.data;
      localStorage.setItem('analysisResults', JSON.stringify(analysis));
      localStorage.setItem('userLocation', payload.location);
      navigate('/analysis');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const severityOptions = [
    { value: 'mild',     en: 'Mild — can continue daily work',   hi: 'हल्का — काम कर सकते हैं' },
    { value: 'moderate', en: 'Moderate — affecting daily work',  hi: 'मध्यम — काम प्रभावित हो रहा है' },
    { value: 'severe',   en: 'Severe — need immediate care',     hi: 'गंभीर — तुरंत इलाज चाहिए' },
  ];
  const durationOptions = [
    { value: 'few_hours', en: 'Few hours',  hi: 'कुछ घंटे' },
    { value: 'few_days',  en: 'Few days',   hi: 'कुछ दिन' },
    { value: 'week',      en: '1 week',     hi: '1 सप्ताह' },
    { value: 'month',     en: '1+ month',   hi: '1+ महीना' },
  ];

  return (
    <div className="soft-page py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Back */}
        <button
          onClick={() => navigate('/home')}   /* BUG FIX: was navigate('/') */
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {lang === 'hi' ? 'होम पर जाएं' : 'Back to Home'}
        </button>

        {/* Emergency SOS Banner */}
        <div className="alert-emergency mb-6 animate-fade-in-up">
          <span className="text-2xl">🚨</span>
          <div className="flex-1">
            <p className="font-bold">
              {lang === 'hi'
                ? 'गंभीर लक्षण? तुरंत कॉल करें!'
                : 'Severe symptoms? Call immediately!'}
            </p>
            <p className="text-sm mt-0.5">
              {lang === 'hi'
                ? 'सीने में दर्द, सांस लेने में दिक्कत, बेहोशी — इसके लिए AI नहीं, डॉक्टर चाहिए'
                : 'Chest pain, difficulty breathing, unconsciousness — skip AI, call a doctor now'}
            </p>
          </div>
          <div className="flex flex-col gap-1 shrink-0">
            <a href="tel:108" className="btn-emergency text-xs px-3 py-1.5">📞 108</a>
            <a href="tel:104" className="rounded-lg border-2 border-red-300 bg-white text-center text-xs font-bold text-red-600 px-3 py-1.5 hover:bg-red-50">📞 104</a>
          </div>
        </div>

        <div className="panel p-6 md:p-8 animate-fade-in-up">
          <div className="text-center mb-8">
            <div className="brand-mark mb-4">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-950">
              {lang === 'hi' ? 'लक्षण बताएं' : 'Describe Your Symptoms'}
            </h1>
            <p className="mt-2 text-slate-500 text-sm">
              {lang === 'hi'
                ? 'AI आपके लक्षण देखकर नजदीकी क्लिनिक और सलाह देगा'
                : 'AI will analyze and suggest nearby clinics in your area'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Language */}
            <div>
              <label className="label">{lang === 'hi' ? 'भाषा चुनें' : 'Choose Language'}</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="field">
                {languageOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Symptoms */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">
                  {lang === 'hi' ? 'आपके लक्षण क्या हैं?' : 'What symptoms are you experiencing?'}
                </label>
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  disabled={listening}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    listening
                      ? 'bg-red-100 text-red-700 animate-pulse'
                      : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                  } disabled:opacity-60`}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  {listening
                    ? (lang === 'hi' ? 'सुन रहा हूं...' : 'Listening...')
                    : (lang === 'hi' ? 'बोलकर बताएं' : 'Speak symptoms')}
                </button>
              </div>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder={placeholderText}
                rows={4}
                className="field resize-y"
                required
              />

              {/* Quick symptom chips */}
              <div className="mt-3">
                <p className="text-xs text-slate-400 mb-2">
                  {lang === 'hi' ? 'जल्दी चुनें:' : 'Quick select:'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {ruralSymptoms.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSymptoms(lang === 'hi' ? s.hi : s.en)}
                      className="symptom-chip"
                    >
                      {lang === 'hi' ? s.hi : s.en}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Severity & Duration */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">{lang === 'hi' ? 'गंभीरता' : 'Severity'}</label>
                <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="field">
                  {severityOptions.map((o) => (
                    <option key={o.value} value={o.value}>{lang === 'hi' ? o.hi : o.en}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">{lang === 'hi' ? 'कब से?' : 'How long?'}</label>
                <select value={duration} onChange={(e) => setDuration(e.target.value)} className="field">
                  {durationOptions.map((o) => (
                    <option key={o.value} value={o.value}>{lang === 'hi' ? o.hi : o.en}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="label">
                {lang === 'hi' ? 'आपका गाँव/जिला (वैकल्पिक)' : 'Your Village/District (optional)'}
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={lang === 'hi' ? 'जैसे: पटना, मुज़फ्फरपुर, गाज़ियाबाद...' : 'E.g., Patna, Muzaffarpur, Gaya...'}
                className="field"
              />
            </div>

            {error && (
              <div className="alert-emergency">
                <span>⚠️</span>
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !symptoms.trim()}
              className="btn-primary w-full py-4 text-base"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {lang === 'hi' ? 'AI जांच कर रहा है...' : 'Analyzing with AI...'}
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  {lang === 'hi' ? 'लक्षण जांचें' : 'Analyze Symptoms'}
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          {lang === 'hi'
            ? '⚕️ यह AI सहायता है, डॉक्टर की सलाह का विकल्प नहीं। गंभीर स्थिति में डॉक्टर से मिलें।'
            : '⚕️ This is AI assistance, not a substitute for medical advice. Always consult a doctor for serious conditions.'}
        </p>
      </div>
    </div>
  );
};

export default SymptomForm;
