import React, { useState, useEffect } from 'react';
import { useLang } from '../App';


const STORAGE_KEY = 'med_reminders';

const FREQUENCIES = [
  { value: 'once',    en: 'Once a day',       hi: 'दिन में एक बार' },
  { value: 'twice',   en: 'Twice a day',      hi: 'दिन में दो बार' },
  { value: 'thrice',  en: 'Three times a day', hi: 'दिन में तीन बार' },
  { value: 'weekly',  en: 'Once a week',      hi: 'हफ्ते में एक बार' },
];

const MedicineReminder = () => {
  const [reminders, setReminders] = useState([]);
  const [form, setForm] = useState({ name: '', time: '08:00', frequency: 'twice', notes: '' });
  const [showForm, setShowForm] = useState(false);
  const [notifAllowed, setNotifAllowed] = useState(false);
  const [saved, setSaved] = useState(false);
  const { lang } = useLang();


  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    setReminders(stored);
    if ('Notification' in window) {
      setNotifAllowed(Notification.permission === 'granted');
    }
    scheduleAll(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  const requestNotifPermission = async () => {
    if (!('Notification' in window)) {
      alert(lang === 'hi'
        ? 'यह ब्राउज़र नोटिफिकेशन सपोर्ट नहीं करता।'
        : 'This browser does not support notifications.');
      return;
    }
    const result = await Notification.requestPermission();
    setNotifAllowed(result === 'granted');
  };

  const scheduleAll = (remList) => {
    remList.forEach((r) => {
      if (r.active) scheduleNotif(r);
    });
  };

  const scheduleNotif = (reminder) => {
    if (Notification.permission !== 'granted') return;

    const [h, m] = reminder.time.split(':').map(Number);
    const now = new Date();
    const target = new Date();
    target.setHours(h, m, 0, 0);

    // If time already passed today, schedule for tomorrow
    if (target <= now) target.setDate(target.getDate() + 1);

    const delay = target - now;
    if (delay > 0 && delay < 86400000) { // within 24h
      setTimeout(() => {
        new Notification(
          lang === 'hi' ? `💊 दवाई लेने का समय!` : `💊 Medicine Time!`,
          {
            body: lang === 'hi'
              ? `${reminder.name} लेने का समय हो गया।`
              : `Time to take ${reminder.name}.`,
            icon: '/favicon.ico',
          }
        );
      }, delay);
    }
  };

  const saveReminder = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const newReminder = {
      id: Date.now(),
      ...form,
      active: true,
      createdAt: new Date().toISOString(),
    };

    const updated = [...reminders, newReminder];
    setReminders(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    scheduleNotif(newReminder);

    setForm({ name: '', time: '08:00', frequency: 'twice', notes: '' });
    setShowForm(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const toggleReminder = (id) => {
    const updated = reminders.map((r) =>
      r.id === id ? { ...r, active: !r.active } : r
    );
    setReminders(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const deleteReminder = (id) => {
    const updated = reminders.filter((r) => r.id !== id);
    setReminders(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const freqLabel = (val) => {
    const f = FREQUENCIES.find((f) => f.value === val);
    return f ? (lang === 'hi' ? f.hi : f.en) : val;
  };

  const fmt12 = (time24) => {
    const [h, m] = time24.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Notification Permission Banner */}
      {!notifAllowed && (
        <div className="alert-warning animate-fade-in-up">
          <span className="text-xl">🔔</span>
          <div className="flex-1">
            <p className="font-semibold text-sm">
              {lang === 'hi' ? 'नोटिफिकेशन चालू करें' : 'Enable Notifications'}
            </p>
            <p className="text-xs mt-0.5">
              {lang === 'hi'
                ? 'दवाई का समय याद दिलाने के लिए नोटिफिकेशन की अनुमति दें'
                : 'Allow notifications so we can remind you at the right time'}
            </p>
          </div>
          <button onClick={requestNotifPermission} className="btn-primary text-xs px-3 py-2 shrink-0">
            {lang === 'hi' ? 'अनुमति दें' : 'Allow'}
          </button>
        </div>
      )}

      {/* Success */}
      {saved && (
        <div className="alert-success animate-fade-in-up">
          <span>✅</span>
          <p className="font-semibold text-sm">
            {lang === 'hi' ? 'रिमाइंडर सेट हो गया!' : 'Reminder saved successfully!'}
          </p>
        </div>
      )}

      {/* Add New Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary w-full py-3.5"
        >
          + {lang === 'hi' ? 'नई दवाई रिमाइंडर जोड़ें' : 'Add New Medicine Reminder'}
        </button>
      )}

      {/* Add Form */}
      {showForm && (
        <div className="panel p-6 animate-fade-in-up">
          <h3 className="heading-md mb-5">
            💊 {lang === 'hi' ? 'नई दवाई रिमाइंडर' : 'New Medicine Reminder'}
          </h3>
          <form onSubmit={saveReminder} className="space-y-4">
            <div>
              <label className="label">{lang === 'hi' ? 'दवाई का नाम *' : 'Medicine Name *'}</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={lang === 'hi' ? 'जैसे: Paracetamol, ORS, आयरन टैबलेट...' : 'E.g., Paracetamol, ORS, Iron tablet...'}
                className="field"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">{lang === 'hi' ? 'समय' : 'Time'}</label>
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  className="field"
                />
              </div>
              <div>
                <label className="label">{lang === 'hi' ? 'कितनी बार' : 'Frequency'}</label>
                <select
                  value={form.frequency}
                  onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                  className="field"
                >
                  {FREQUENCIES.map((f) => (
                    <option key={f.value} value={f.value}>{lang === 'hi' ? f.hi : f.en}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="label">{lang === 'hi' ? 'नोट (वैकल्पिक)' : 'Notes (optional)'}</label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder={lang === 'hi' ? 'जैसे: खाने के बाद लें...' : 'E.g., Take after meals...'}
                className="field"
              />
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">
                {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
              </button>
              <button type="submit" className="btn-primary flex-1">
                💾 {lang === 'hi' ? 'सेव करें' : 'Save Reminder'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reminders List */}
      {reminders.length === 0 && !showForm && (
        <div className="panel p-12 text-center">
          <p className="text-5xl mb-3">💊</p>
          <h3 className="heading-md mb-2">
            {lang === 'hi' ? 'कोई रिमाइंडर नहीं' : 'No Reminders Yet'}
          </h3>
          <p className="body-sm">
            {lang === 'hi'
              ? 'ऊपर "+ नई दवाई रिमाइंडर जोड़ें" पर क्लिक करें'
              : 'Click "+ Add New Medicine Reminder" above to get started'}
          </p>
        </div>
      )}

      {reminders.length > 0 && (
        <div className="space-y-3">
          <h3 className="heading-md">
            {lang === 'hi' ? 'आपके रिमाइंडर' : 'Your Reminders'} ({reminders.length})
          </h3>
          {reminders.map((r) => (
            <div
              key={r.id}
              className={`panel p-4 flex items-center gap-4 transition-all ${!r.active ? 'opacity-50' : ''}`}
            >
              {/* Icon */}
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${
                r.active ? 'bg-teal-50' : 'bg-slate-100'
              }`}>
                💊
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-slate-900 truncate">{r.name}</h4>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                  <span className="text-xs text-slate-500">
                    🕐 {fmt12(r.time)}
                  </span>
                  <span className="text-xs text-slate-500">
                    🔄 {freqLabel(r.frequency)}
                  </span>
                  {r.notes && (
                    <span className="text-xs text-slate-400">📝 {r.notes}</span>
                  )}
                </div>
              </div>

              {/* Status badge */}
              <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                r.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {r.active
                  ? (lang === 'hi' ? 'चालू' : 'Active')
                  : (lang === 'hi' ? 'बंद' : 'Off')}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => toggleReminder(r.id)}
                  title={r.active ? (lang === 'hi' ? 'बंद करें' : 'Disable') : (lang === 'hi' ? 'चालू करें' : 'Enable')}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition text-sm"
                >
                  {r.active ? '⏸' : '▶'}
                </button>
                <button
                  onClick={() => deleteReminder(r.id)}
                  title={lang === 'hi' ? 'हटाएं' : 'Delete'}
                  className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition text-sm"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      <div className="alert-info">
        <span>💡</span>
        <div className="text-sm">
          <p className="font-semibold">
            {lang === 'hi' ? 'दवाई टिप:' : 'Medicine Tip:'}
          </p>
          <p className="mt-0.5">
            {lang === 'hi'
              ? 'हमेशा दवाई का पूरा कोर्स करें, भले ही बेहतर लग रहा हो। बीच में बंद करने से बैक्टीरिया मजबूत हो जाते हैं।'
              : 'Always complete the full course of medicine, even if you feel better. Stopping early can make bacteria resistant.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MedicineReminder;
