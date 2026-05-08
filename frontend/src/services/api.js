import axios from 'axios';

const LOCAL_API_BASE = 'http://127.0.0.1:8000/api';
const API_BASE = process.env.REACT_APP_API_BASE || LOCAL_API_BASE;

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// ─── Request Interceptor: attach auth token to every request ───────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && token !== 'loggedin') {
      config.headers['Authorization'] = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: handle 401 globally ─────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      error.message = `Cannot reach the backend server at ${API_BASE}.`;
    }
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/users/register/', data),
  login: (data) => api.post('/users/login/', data),
  logout: () => api.post('/users/logout/'),
  profile: () => api.get('/users/profile/'),
  updateProfile: (data) => api.patch('/users/profile/', data),
};

export const symptomsAPI = {
  analyze: (data) => api.post('/symptoms/analyze/', data),
  history: () => api.get('/symptoms/history/'),
};

export const hospitalsAPI = {
  list: (params) => api.get('/hospitals/list/', { params }),
  nearest: (params) => api.get('/hospitals/nearest/', { params }),
};

export const appointmentsAPI = {
  book: (data) => api.post('/appointments/book/', data),
  my: () => api.get('/appointments/my/'),
  cancel: (id) => api.patch(`/appointments/${id}/cancel/`),
};

export default api;
