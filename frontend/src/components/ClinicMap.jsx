import React, { useCallback, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { hospitalsAPI } from '../services/api';
import { useLang } from '../App';

// Fix default Leaflet marker icons (broken with webpack)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Hospital custom icon
const hospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const DEFAULT_CENTER = { lat: 25.5941, lng: 85.1376 }; // Patna, Bihar

// Component to recenter map
const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => { map.setView([center.lat, center.lng], 12); }, [center, map]);
  return null;
};

const ClinicMap = () => {
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [userPos, setUserPos] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { lang } = useLang();

  const fetchHospitals = useCallback(async (lat, lng) => {
    try {
      const res = await hospitalsAPI.nearest({ lat, lng });
      setHospitals(res.data);
    } catch (err) {
      console.error('Hospital fetch error:', err);
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchByName = useCallback(async (location) => {
    try {
      const res = await hospitalsAPI.list({ location });
      setHospitals(res.data);
    } catch {
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadNearby = useCallback(() => {
    if (!navigator.geolocation) {
      fetchHospitals(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCenter(coords);
        setUserPos(coords);
        fetchHospitals(coords.lat, coords.lng);
      },
      () => fetchHospitals(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng)
    );
  }, [fetchHospitals]);

  useEffect(() => { loadNearby(); }, [loadNearby]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLoading(true);
      fetchByName(searchQuery.trim());
    }
  };

  const typeLabel = (t) => {
    const map = {
      PHC: lang === 'hi' ? 'प्राथमिक स्वास्थ्य केंद्र' : 'Primary Health Centre',
      CHC: lang === 'hi' ? 'सामुदायिक स्वास्थ्य केंद्र' : 'Community Health Centre',
      'District Hospital': lang === 'hi' ? 'जिला अस्पताल' : 'District Hospital',
      'Private Clinic': lang === 'hi' ? 'प्राइवेट क्लिनिक' : 'Private Clinic',
    };
    return map[t] || t;
  };

  return (
    <div className="space-y-5">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={lang === 'hi' ? 'जिला खोजें: पटना, गया, वाराणसी...' : 'Search by district: Patna, Gaya, Varanasi...'}
          className="field flex-1"
        />
        <button type="submit" className="btn-primary px-5">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {lang === 'hi' ? 'खोजें' : 'Search'}
        </button>
        <button type="button" onClick={loadNearby} className="btn-secondary px-4" title={lang === 'hi' ? 'मेरी लोकेशन' : 'My Location'}>
          📍
        </button>
      </form>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-sm text-slate-600">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-500" />
          {lang === 'hi' ? 'क्लिनिक' : 'Clinics'}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-blue-500" />
          {lang === 'hi' ? 'आपकी लोकेशन' : 'Your Location'}
        </span>
        <span className="ml-auto font-semibold text-teal-700">
          {hospitals.length} {lang === 'hi' ? 'क्लिनिक मिले' : 'clinics found'}
        </span>
      </div>

      {/* Map */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
        {loading ? (
          <div className="h-96 flex items-center justify-center bg-slate-100">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" />
              <p className="text-sm text-slate-500">
                {lang === 'hi' ? 'क्लिनिक ढूंढ रहे हैं...' : 'Finding nearby clinics...'}
              </p>
            </div>
          </div>
        ) : (
          <MapContainer
            center={[center.lat, center.lng]}
            zoom={12}
            style={{ height: '420px', width: '100%' }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <RecenterMap center={center} />

            {/* User position */}
            {userPos && (
              <Marker position={[userPos.lat, userPos.lng]} icon={userIcon}>
                <Popup>
                  <div className="text-center">
                    <p className="font-bold">📍 {lang === 'hi' ? 'आप यहाँ हैं' : 'You are here'}</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Hospital markers */}
            {hospitals.map((h, i) => {
              const lat = parseFloat(h.latitude || h.lat);
              const lng = parseFloat(h.longitude || h.lng);
              if (isNaN(lat) || isNaN(lng)) return null;
              return (
                <Marker key={i} position={[lat, lng]} icon={hospitalIcon}
                  eventHandlers={{ click: () => setSelectedClinic(h) }}>
                  <Popup>
                    <div className="min-w-48 p-1">
                      <h4 className="font-bold text-slate-900 mb-1">{h.name}</h4>
                      <p className="text-xs text-slate-500 mb-2">{typeLabel(h.type)} • {h.district}</p>
                      {h.distance && (
                        <p className="text-xs font-semibold text-teal-700 mb-2">
                          📍 {typeof h.distance === 'number' ? `${h.distance.toFixed(1)} km` : h.distance}
                        </p>
                      )}
                      <a href={`tel:${h.phone}`}
                        className="block w-full rounded-lg bg-teal-600 py-1.5 text-center text-xs font-bold text-white hover:bg-teal-700">
                        📞 {lang === 'hi' ? 'कॉल करें' : 'Call Now'} — {h.phone}
                      </a>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}
      </div>

      {/* Clinic List */}
      <div>
        <h3 className="heading-md mb-4">
          {lang === 'hi' ? 'क्लिनिक सूची' : 'Clinic List'}
        </h3>
        {hospitals.length === 0 && !loading && (
          <div className="panel p-8 text-center">
            <p className="text-2xl mb-2">🏥</p>
            <p className="text-slate-500">
              {lang === 'hi'
                ? 'इस क्षेत्र में कोई क्लिनिक नहीं मिला। दूसरा जिला खोजें।'
                : 'No clinics found for this area. Try searching another district.'}
            </p>
          </div>
        )}
        <div className="grid sm:grid-cols-2 gap-4">
          {hospitals.map((h, i) => (
            <div
              key={i}
              onClick={() => setSelectedClinic(h)}
              className={`panel p-4 cursor-pointer transition-all ${selectedClinic === h ? 'border-teal-400 shadow-md' : ''}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 pr-2">
                  <h4 className="font-semibold text-slate-900 text-sm leading-snug">{h.name}</h4>
                  <p className="text-xs text-teal-600 font-medium mt-0.5">{typeLabel(h.type)}</p>
                </div>
                {h.distance && (
                  <span className="shrink-0 rounded-full bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-700">
                    {typeof h.distance === 'number' ? `${h.distance.toFixed(1)} km` : h.distance}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mb-3">{h.address || h.district}</p>
              <div className="flex items-center gap-3">
                <a href={`tel:${h.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-700 transition">
                  📞 {h.phone}
                </a>
                {h.services && (
                  <span className="text-xs text-slate-400">
                    {Array.isArray(h.services) ? h.services.slice(0, 2).join(', ') : h.services}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClinicMap;
