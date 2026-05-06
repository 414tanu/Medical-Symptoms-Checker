import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import SymptomForm from './components/SymptomForm';
import AnalysisResults from './components/AnalysisResults';
import ClinicMap from './components/ClinicMap';
import AppointmentBooker from './components/AppointmentBooker';
import UserDashboard from './components/UserDashboard';
import Login from './components/Login';
import Register from './components/Register';
import UserProfile from './components/UserProfile';
import MedicineReminder from './components/MedicineReminder';
import './index.css';

/* ─── Language Context ─────────────────────────────────────────────────────── */
export const LangContext = React.createContext({ lang: 'en', setLang: () => {} });
export const useLang = () => React.useContext(LangContext);

export const t = (en, hi) => (lang) => lang === 'hi' ? hi : en;

/* ─── Protected Route ──────────────────────────────────────────────────────── */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="soft-page flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" />
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" />;
};

/* ─── Top Navigation ───────────────────────────────────────────────────────── */
const AppNav = () => {
  const { user, logout } = useAuth();
  const { lang, setLang } = useLang();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { to: '/home', label: 'Home' },
    { to: '/symptoms', label: lang === 'hi' ? 'लक्षण जांचें' : 'Symptoms' },
    { to: '/hospitals', label: lang === 'hi' ? 'अस्पताल' : 'Hospitals' },
    { to: '/appointments', label: lang === 'hi' ? 'अपॉइंटमेंट' : 'Appointments' },
    { to: '/reminders', label: lang === 'hi' ? 'दवाई रिमाइंडर' : 'Reminders' },
    { to: '/dashboard', label: lang === 'hi' ? 'डैशबोर्ड' : 'Dashboard' },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="app-container">
        <div className="flex items-center justify-between py-3">
          {/* Brand */}
          <Link to="/home" className="flex items-center gap-2.5">
            <div className="brand-icon">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-slate-900">
              {lang === 'hi' ? 'स्वास्थ्य AI' : 'HealthCheck AI'}
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => isActive ? 'nav-link-active' : 'nav-link'}
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
              className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              title="Toggle Language"
            >
              <span>{lang === 'en' ? '🇮🇳 हिंदी' : '🇬🇧 English'}</span>
            </button>

            {/* Emergency */}
            <a
              href="tel:108"
              className="hidden sm:flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 transition"
            >
              🚨 108
            </a>

            {/* Profile or login */}
            {user ? (
              <div className="flex items-center gap-2">
                <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-link-active' : 'nav-link'}>
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                    {(user.name || user.phone || 'U')[0].toUpperCase()}
                  </div>
                </NavLink>
                <button onClick={handleLogout} className="nav-link text-red-500 hover:text-red-700 hover:bg-red-50">
                  {lang === 'hi' ? 'लॉग आउट' : 'Logout'}
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary px-4 py-2 text-sm">
                {lang === 'hi' ? 'लॉगिन' : 'Login'}
              </Link>
            )}

            {/* Mobile menu */}
            <button className="lg:hidden p-2 rounded-lg hover:bg-slate-100" onClick={() => setMenuOpen(!menuOpen)}>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-slate-100 py-3 space-y-1 animate-fade-in-up">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg text-sm font-medium transition ${isActive ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50'}`
                }
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
            <div className="flex gap-2 pt-2 px-3">
              <button
                onClick={() => { setLang(lang === 'en' ? 'hi' : 'en'); setMenuOpen(false); }}
                className="flex-1 rounded-lg border border-slate-200 py-2 text-xs font-semibold text-slate-600"
              >
                {lang === 'en' ? '🇮🇳 हिंदी' : '🇬🇧 English'}
              </button>
              <a href="tel:108" className="flex-1 rounded-lg bg-red-600 py-2 text-center text-xs font-bold text-white">
                🚨 108 Emergency
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

/* ─── Auth Start Page ──────────────────────────────────────────────────────── */
const AuthStart = () => {
  const { lang, setLang } = useLang();
  return (
    <div className="soft-page scene-3d flex flex-col">
      <div className="orbital-health" aria-hidden="true">
        <span className="medical-cube cube-a">+</span>
        <span className="medical-cube cube-b">AI</span>
        <span className="medical-cube cube-c">24</span>
      </div>
      {/* Emergency Strip */}
      <div className="bg-red-600 text-white text-center py-2 text-sm font-semibold">
        🚨 {lang === 'hi' ? 'आपातकाल में कॉल करें:' : 'Emergency:'}&nbsp;
        <a href="tel:108" className="underline font-bold">108 Ambulance</a>&nbsp;|&nbsp;
        <a href="tel:104" className="underline font-bold">104 Health</a>&nbsp;|&nbsp;
        <a href="tel:112" className="underline font-bold">112 Police</a>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="auth-panel card-3d text-center animate-float-in">
          <div className="brand-mark">
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h1 className="mt-5 text-2xl font-bold text-slate-950">
            {lang === 'hi' ? 'स्वास्थ्य AI' : 'HealthCheck AI'}
          </h1>
          <p className="mt-2 text-sm text-slate-500 leading-6">
            {lang === 'hi'
              ? 'ग्रामीण भारत के लिए AI-आधारित स्वास्थ्य सहायक'
              : 'AI-powered healthcare assistant for rural India'}
          </p>

          {/* Feature pills */}
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {[
              { icon: '🤖', label: lang === 'hi' ? 'AI जांच' : 'AI Triage' },
              { icon: '🏥', label: lang === 'hi' ? 'नजदीकी क्लिनिक' : 'Nearby Clinics' },
              { icon: '📅', label: lang === 'hi' ? 'अपॉइंटमेंट' : 'Appointments' },
              { icon: '💊', label: lang === 'hi' ? 'दवाई रिमाइंडर' : 'Med Reminders' },
            ].map((f) => (
              <span key={f.label} className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
                {f.icon} {f.label}
              </span>
            ))}
          </div>

          <div className="mt-8 space-y-3">
            <Link to="/login" className="btn-primary w-full">
              {lang === 'hi' ? 'लॉगिन करें' : 'Login'}
            </Link>
            <Link to="/register" className="btn-secondary w-full">
              {lang === 'hi' ? 'नया खाता बनाएं' : 'Create Account'}
            </Link>
          </div>

          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className="mt-6 text-xs text-slate-400 hover:text-slate-600 underline"
          >
            {lang === 'hi' ? 'Switch to English' : 'हिंदी में देखें'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Home Page ────────────────────────────────────────────────────────────── */
const Home = () => {
  const { lang } = useLang();


  const features = [
    {
      icon: '🤖',
      color: 'bg-teal-50 text-teal-700',
      title: lang === 'hi' ? 'AI लक्षण जांच' : 'AI Symptom Check',
      desc: lang === 'hi'
        ? 'हिंदी या अंग्रेजी में लक्षण बताएं, AI तुरंत बताएगा'
        : 'Describe symptoms in Hindi or English, get instant AI triage',
    },
    {
      icon: '🏥',
      color: 'bg-blue-50 text-blue-700',
      title: lang === 'hi' ? 'नजदीकी क्लिनिक' : 'Nearby Clinics',
      desc: lang === 'hi'
        ? 'बिहार-UP के PHC, CHC और सरकारी अस्पताल खोजें'
        : 'Find PHCs, CHCs and hospitals across Bihar & Uttar Pradesh',
    },
    {
      icon: '📅',
      color: 'bg-purple-50 text-purple-700',
      title: lang === 'hi' ? 'अपॉइंटमेंट बुकिंग' : 'Appointment Booking',
      desc: lang === 'hi'
        ? 'डॉक्टर से मिलने का समय तुरंत बुक करें'
        : 'Book clinic visits and manage appointments easily',
    },
    {
      icon: '💊',
      color: 'bg-amber-50 text-amber-700',
      title: lang === 'hi' ? 'दवाई रिमाइंडर' : 'Medicine Reminders',
      desc: lang === 'hi'
        ? 'दवाई समय पर लेने के लिए अलार्म लगाएं'
        : 'Set reminders so you never miss a dose',
    },
    {
      icon: '🎤',
      color: 'bg-green-50 text-green-700',
      title: lang === 'hi' ? 'आवाज से जांच' : 'Voice Input',
      desc: lang === 'hi'
        ? '11 भारतीय भाषाओं में बोलकर लक्षण बताएं'
        : 'Speak symptoms in 11 Indian languages',
    },
    {
      icon: '📵',
      color: 'bg-slate-50 text-slate-700',
      title: lang === 'hi' ? 'ऑफलाइन काम करे' : 'Works Offline',
      desc: lang === 'hi'
        ? 'बिना इंटरनेट के भी बेसिक जांच कर सकते हैं'
        : 'Basic symptom checking works without internet',
    },
  ];

  return (
    <div className="page-shell">
      <AppNav />

      {/* Emergency Strip */}
      <div className="bg-red-600 text-white py-2 text-center text-sm font-medium">
        🚨 {lang === 'hi' ? 'आपातकाल:' : 'Emergency:'}&nbsp;
        <a href="tel:108" className="underline font-bold">108 Ambulance</a>&nbsp;•&nbsp;
        <a href="tel:104" className="underline font-bold">104 Health Helpline</a>&nbsp;•&nbsp;
        <a href="tel:112" className="underline font-bold">112 Police</a>
      </div>

      <main>
        {/* Hero */}
        <section className="relative scene-3d overflow-hidden py-16 md:py-24" style={{
          background: 'linear-gradient(135deg, #f0fdfa 0%, #ffffff 60%, #eff6ff 100%)'
        }}>
          <div className="orbital-health hero-orbit" aria-hidden="true">
            <span className="medical-cube cube-a">+</span>
            <span className="medical-cube cube-b">AI</span>
            <span className="medical-cube cube-c">24</span>
          </div>
          <div className="app-container text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-4 py-1.5 text-sm font-semibold text-teal-700 animate-fade-in-up">
              🌾 {lang === 'hi' ? 'ग्रामीण भारत के लिए' : 'Built for Rural India'}
            </span>
            <h1 className="mt-5 heading-xl animate-fade-in-up-delay-1">
              {lang === 'hi'
                ? <>आपकी सेहत,<br /><span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #0d9488, #0891b2)' }}>हमारी जिम्मेदारी</span></>
                : <>Your Health,<br /><span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #0d9488, #0891b2)' }}>Our Responsibility</span></>
              }
            </h1>
            <p className="mx-auto mt-5 max-w-2xl body-lg animate-fade-in-up-delay-2">
              {lang === 'hi'
                ? 'डॉक्टर तक पहुंचना मुश्किल है? अपने लक्षण बताएं, AI तुरंत मदद करेगा और नजदीकी क्लिनिक दिखाएगा।'
                : 'Doctor access is hard in rural areas? Describe your symptoms, get AI-powered triage, and find the nearest clinic instantly.'}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center animate-fade-in-up-delay-3">
              <Link to="/symptoms" className="btn-primary px-8 py-4 text-base">
                {lang === 'hi' ? '🔍 लक्षण जांचें अभी' : '🔍 Check Symptoms Now'}
              </Link>
              <Link to="/hospitals" className="btn-secondary px-8 py-4 text-base">
                {lang === 'hi' ? '🏥 नजदीकी क्लिनिक' : '🏥 Find Nearest Clinic'}
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-10 flex flex-wrap justify-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">✅ {lang === 'hi' ? 'AI-आधारित' : 'AI-Powered'}</span>
              <span className="flex items-center gap-1">✅ {lang === 'hi' ? 'हिंदी सपोर्ट' : 'Hindi Support'}</span>
              <span className="flex items-center gap-1">✅ {lang === 'hi' ? 'मुफ़्त' : 'Free to Use'}</span>
              <span className="flex items-center gap-1">✅ {lang === 'hi' ? 'ऑफलाइन भी काम करे' : 'Works Offline'}</span>
            </div>
          </div>
        </section>

        {/* Quick SOS Card */}
        <section className="app-container -mt-4 mb-8">
          <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-bold text-red-800 text-lg">
                🚨 {lang === 'hi' ? 'आपातकाल में तुरंत कॉल करें' : 'In an Emergency, Call Immediately'}
              </p>
              <p className="text-sm text-red-600 mt-1">
                {lang === 'hi'
                  ? 'गंभीर सीने में दर्द, सांस लेने में दिक्कत, बेहोशी, बहुत ज़्यादा खून बहना'
                  : 'Chest pain, difficulty breathing, unconsciousness, heavy bleeding'}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <a href="tel:108" className="btn-emergency text-sm px-4 py-2.5">📞 108 Ambulance</a>
              <a href="tel:104" className="inline-flex items-center gap-1 rounded-xl border-2 border-red-400 bg-white px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition">📞 104 Health</a>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="app-container py-8 pb-16">
          <h2 className="heading-lg text-center mb-2">
            {lang === 'hi' ? 'हमारी सेवाएं' : 'What We Offer'}
          </h2>
          <p className="text-center body-md mb-10">
            {lang === 'hi'
              ? 'ग्रामीण भारत के लिए जरूरी स्वास्थ्य सेवाएं एक जगह'
              : 'Essential healthcare services for rural India, all in one place'}
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <div
                key={f.title}
                className={`panel p-6 animate-fade-in-up`}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${f.color}`}>
                  {f.icon}
                </div>
                <h3 className="heading-md mb-2">{f.title}</h3>
                <p className="body-sm leading-6">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

/* ─── Hospitals Page ────────────────────────────────────────────────────────── */
const HospitalsPage = () => {
  const { lang } = useLang();
  return (
    <div className="page-shell">
      <AppNav />
      <main className="app-container py-10">
        <div className="mb-8 text-center">
          <h1 className="heading-lg">
            {lang === 'hi' ? 'नजदीकी अस्पताल खोजें' : 'Find Hospitals Near You'}
          </h1>
          <p className="body-md mt-2">
            {lang === 'hi'
              ? 'सरकारी PHC, CHC और प्राइवेट क्लिनिक आपके पास'
              : 'Government PHCs, CHCs, and private clinics within reach'}
          </p>
        </div>
        <ClinicMap />
      </main>
    </div>
  );
};

/* ─── Appointments Page ─────────────────────────────────────────────────────── */
const AppointmentsPage = () => {
  const { lang } = useLang();
  return (
    <div className="page-shell">
      <AppNav />
      <main className="app-container py-10">
        <div className="mb-8 text-center">
          <h1 className="heading-lg">
            {lang === 'hi' ? 'अपॉइंटमेंट बुक करें' : 'Book an Appointment'}
          </h1>
          <p className="body-md mt-2">
            {lang === 'hi'
              ? 'डॉक्टर से मिलने का समय तुरंत बुक करें'
              : 'Book a clinic visit in minutes'}
          </p>
        </div>
        <AppointmentBooker />
      </main>
    </div>
  );
};

/* ─── Medicine Reminders Page ───────────────────────────────────────────────── */
const RemindersPage = () => {
  const { lang } = useLang();
  return (
    <div className="page-shell">
      <AppNav />
      <main className="app-container py-10">
        <div className="mb-8 text-center">
          <h1 className="heading-lg">
            {lang === 'hi' ? 'दवाई रिमाइंडर' : 'Medicine Reminders'}
          </h1>
          <p className="body-md mt-2">
            {lang === 'hi'
              ? 'दवाई समय पर लेने के लिए अलार्म लगाएं'
              : 'Set alarms so you never miss your medicine'}
          </p>
        </div>
        <MedicineReminder />
      </main>
    </div>
  );
};

/* ─── App Router ────────────────────────────────────────────────────────────── */
function AppContent() {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'en');

  const handleSetLang = (l) => {
    setLang(l);
    localStorage.setItem('lang', l);
  };

  return (
    <LangContext.Provider value={{ lang, setLang: handleSetLang }}>
      <Router>
        <Routes>
          <Route path="/" element={<AuthStart />} />
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/symptoms" element={<ProtectedRoute><SymptomForm /></ProtectedRoute>} />
          <Route path="/analysis" element={<ProtectedRoute><AnalysisResults /></ProtectedRoute>} />
          <Route path="/hospitals" element={<ProtectedRoute><HospitalsPage /></ProtectedRoute>} />
          <Route path="/appointments" element={<ProtectedRoute><AppointmentsPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/reminders" element={<ProtectedRoute><RemindersPage /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </LangContext.Provider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
