import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    email: '',
    age: '',
    gender: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const formatApiError = (data) => {
    if (!data) {
      return 'Could not create your account. Please check your details.';
    }

    if (typeof data === 'string') {
      return data;
    }

    return Object.entries(data)
      .map(([field, messages]) => {
        const text = Array.isArray(messages) ? messages.join(' ') : String(messages);
        const label = field === 'non_field_errors' ? 'Error' : field.charAt(0).toUpperCase() + field.slice(1);
        return `${label}: ${text}`;
      })
      .join(' ');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const digits = formData.phone.replace(/\D/g, '').slice(-10);
    const phone = `+91${digits}`;

    if (digits.length !== 10) {
      setLoading(false);
      setError('Enter a valid 10 digit phone number.');
      return;
    }

    try {
      await authAPI.register({
        phone,
        password: formData.password,
        email: formData.email.trim(),
        age: formData.age || null,
        gender: formData.gender || '',
      });
      await login({ phone, password: formData.password });
      navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      setError(formatApiError(data || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="soft-page scene-3d flex items-center justify-center py-12 px-4">
      <div className="orbital-health" aria-hidden="true">
        <span className="medical-cube cube-a">+</span>
        <span className="medical-cube cube-b">AI</span>
        <span className="medical-cube cube-c">24</span>
      </div>
      <div className="auth-panel card-3d animate-float-in">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>

        <div className="text-center">
          <div className="brand-mark">+</div>
          <h2 className="mt-6 text-3xl font-bold text-slate-950">Create Account</h2>
          <p className="mt-2 text-sm text-slate-600">After creating an account, you will be logged in automatically.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="label">Phone Number</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500 text-sm">+91</span>
              <input
                type="tel"
                value={formData.phone.replace(/^\+91/, '')}
                onChange={(event) => setFormData({ ...formData, phone: event.target.value.replace(/\D/g, '').slice(0, 10) })}
                className="field pl-20"
                placeholder="98XXXXXXXX"
                pattern="[0-9]{10}"
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(event) => setFormData({ ...formData, password: event.target.value })}
              className="field"
              minLength={6}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Age</label>
              <input
                type="number"
                value={formData.age}
                onChange={(event) => setFormData({ ...formData, age: event.target.value })}
                className="field"
                min="1"
              />
            </div>
            <div>
              <label className="label">Gender</label>
              <select
                value={formData.gender}
                onChange={(event) => setFormData({ ...formData, gender: event.target.value })}
                className="field"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Email optional</label>
            <input
              type="email"
              value={formData.email}
              onChange={(event) => setFormData({ ...formData, email: event.target.value })}
              className="field"
              placeholder="you@example.com"
            />
          </div>

          {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800 animate-fade-in-up">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <div className="text-center">
          <Link to="/login" className="text-sm font-medium text-teal-700 hover:text-teal-800">
            Already have account? Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
