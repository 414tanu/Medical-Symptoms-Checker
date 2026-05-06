import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointmentsAPI } from '../services/api';
import { Link } from 'react-router-dom';
import { useLang } from '../App';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { lang } = useLang();

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const res = await appointmentsAPI.my();
      setAppointments(res.data.slice(0, 5));
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    confirmed: { label: lang === 'hi' ? 'कन्फर्म' : 'Confirmed', cls: 'bg-green-100 text-green-800' },
    completed: { label: lang === 'hi' ? 'पूरा हुआ' : 'Completed', cls: 'bg-emerald-100 text-emerald-800' },
    cancelled: { label: lang === 'hi' ? 'रद्द' : 'Cancelled', cls: 'bg-red-100 text-red-800' },
    pending:   { label: lang === 'hi' ? 'पेंडिंग' : 'Pending',   cls: 'bg-yellow-100 text-yellow-800' },
  };

  const fmt = (d) => new Date(d).toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  });

  // Health tips for rural India (seasonal)
  const tips = [
    { icon: '💧', en: 'Drink ORS when dehydrated — not cold drinks', hi: 'उल्टी-दस्त में ORS पिएं — ठंडा पेय नहीं' },
    { icon: '🦟', en: 'Use mosquito nets at night to prevent malaria', hi: 'मलेरिया से बचने के लिए रात में मच्छरदानी लगाएं' },
    { icon: '🤲', en: 'Wash hands before eating and after toilet', hi: 'खाने से पहले और शौच के बाद हाथ धोएं' },
    { icon: '🥛', en: 'Boil drinking water or use a filter', hi: 'पीने का पानी उबालें या फिल्टर करें' },
    { icon: '💊', en: 'Complete your full course of TB medicines', hi: 'TB की दवाई पूरा कोर्स करें, बीच में बंद न करें' },
    { icon: '🌿', en: 'Eat leafy vegetables to prevent anemia', hi: 'एनीमिया से बचने के लिए हरी सब्जियां खाएं' },
  ];
  const tip = tips[new Date().getDate() % tips.length];

  if (loading) return (
    <div className="soft-page flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" />
        <p className="text-sm text-slate-500">{lang === 'hi' ? 'लोड हो रहा है...' : 'Loading...'}</p>
      </div>
    </div>
  );

  return (
    <div className="soft-page py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <Link
          to="/home"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {lang === 'hi' ? 'होम पर जाएं' : 'Back to Home'}
        </Link>

        {/* Welcome Header */}
        <div className="panel-glass p-6 flex items-center gap-5 animate-fade-in-up">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-white text-2xl font-bold"
            style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}>
            {(user?.name || user?.phone || 'U')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="heading-md truncate">
              {lang === 'hi' ? 'नमस्ते' : 'Welcome back'},&nbsp;
              {user?.name || (lang === 'hi' ? 'मरीज़' : 'Patient')}!
            </h1>
            <p className="body-sm mt-0.5">{user?.phone || ''}</p>
          </div>
          <Link to="/profile" className="btn-secondary text-sm shrink-0">
            {lang === 'hi' ? 'प्रोफाइल' : 'My Profile'}
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in-up-delay-1">
          {[
            { icon: '📋', value: appointments.length, label: lang === 'hi' ? 'कुल अपॉइंटमेंट' : 'Total Appointments', color: 'text-teal-600' },
            { icon: '📅', value: appointments.filter(a => a.status === 'confirmed').length, label: lang === 'hi' ? 'आने वाली' : 'Upcoming', color: 'text-blue-600' },
            { icon: '✅', value: appointments.filter(a => a.status === 'completed').length, label: lang === 'hi' ? 'पूरी हो गईं' : 'Completed', color: 'text-green-600' },
            { icon: '🔍', value: '24/7', label: lang === 'hi' ? 'AI जांच उपलब्ध' : 'AI Available', color: 'text-purple-600' },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <p className="text-xs text-slate-500 mt-1 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Health Tip of the Day */}
        <div className="alert-info animate-fade-in-up-delay-2">
          <span className="text-2xl">{tip.icon}</span>
          <div>
            <p className="text-sm font-bold">{lang === 'hi' ? 'आज का स्वास्थ्य टिप:' : "Today's Health Tip:"}</p>
            <p className="text-sm mt-0.5">{lang === 'hi' ? tip.hi : tip.en}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in-up-delay-2">
          {[
            { to: '/symptoms', icon: '🔍', label: lang === 'hi' ? 'लक्षण जांचें' : 'Check Symptoms', color: 'from-teal-500 to-cyan-500' },
            { to: '/hospitals', icon: '🏥', label: lang === 'hi' ? 'क्लिनिक खोजें' : 'Find Clinic', color: 'from-blue-500 to-indigo-500' },
            { to: '/appointments', icon: '📅', label: lang === 'hi' ? 'अपॉइंटमेंट' : 'Appointment', color: 'from-purple-500 to-pink-500' },
            { to: '/reminders', icon: '💊', label: lang === 'hi' ? 'दवाई रिमाइंडर' : 'Reminders', color: 'from-amber-500 to-orange-500' },
          ].map((a) => (
            <Link key={a.to} to={a.to}
              className={`rounded-2xl bg-gradient-to-br ${a.color} p-5 text-center text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all`}>
              <div className="text-3xl mb-2">{a.icon}</div>
              <p className="text-sm font-semibold leading-tight">{a.label}</p>
            </Link>
          ))}
        </div>

        {/* Recent Appointments */}
        <div className="panel animate-fade-in-up-delay-3">
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <h2 className="heading-md">{lang === 'hi' ? 'हाल की अपॉइंटमेंट' : 'Recent Appointments'}</h2>
            <Link to="/appointments" className="text-sm font-semibold text-teal-600 hover:text-teal-700">
              {lang === 'hi' ? 'सब देखें →' : 'View All →'}
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {appointments.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-4xl mb-3">📅</p>
                <p className="text-slate-500 mb-4">
                  {lang === 'hi' ? 'अभी तक कोई अपॉइंटमेंट नहीं है' : 'No appointments yet'}
                </p>
                <Link to="/appointments" className="btn-primary text-sm px-5 py-2.5">
                  {lang === 'hi' ? 'पहली अपॉइंटमेंट बुक करें' : 'Book First Appointment'}
                </Link>
              </div>
            ) : appointments.map((appt, i) => {
              const sc = statusConfig[appt.status] || { label: appt.status, cls: 'bg-gray-100 text-gray-800' };
              return (
                <div key={i} className="p-5 hover:bg-slate-50 transition flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${sc.cls}`}>
                        {sc.label}
                      </span>
                    </div>
                    <h4 className="font-semibold text-slate-900 truncate">{appt.clinic_name}</h4>
                    <p className="text-sm text-slate-500">{fmt(appt.date)} • {appt.time}</p>
                  </div>
                  {appt.status === 'confirmed' && (
                    <a href="tel:108" className="shrink-0 text-xs font-semibold text-teal-600 hover:underline">
                      {lang === 'hi' ? 'रिमाइंडर' : 'Remind'}
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Emergency + Logout */}
        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up">
          <div className="flex-1 rounded-2xl border-2 border-red-200 bg-red-50 p-4 flex items-center justify-between gap-3">
            <div>
              <p className="font-bold text-red-800 text-sm">🚨 {lang === 'hi' ? 'आपातकाल' : 'Emergency'}</p>
              <p className="text-xs text-red-600">{lang === 'hi' ? 'गंभीर स्थिति में कॉल करें' : 'Call for serious conditions'}</p>
            </div>
            <div className="flex gap-2">
              <a href="tel:108" className="btn-emergency text-xs px-3 py-2">108</a>
              <a href="tel:104" className="rounded-lg border-2 border-red-300 bg-white px-3 py-2 text-xs font-bold text-red-600">104</a>
            </div>
          </div>
          <button
            onClick={logout}
            className="btn-secondary sm:w-auto w-full text-red-500 border-red-200 hover:bg-red-50"
          >
            🚪 {lang === 'hi' ? 'लॉग आउट' : 'Logout'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
