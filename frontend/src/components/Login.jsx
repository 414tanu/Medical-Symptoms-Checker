import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (event) => {
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
      await login({ phone, password: formData.password });
      navigate('/dashboard');
    } catch (err) {
      if (!err.response) {
        setError('Cannot reach the backend server. Check REACT_APP_API_BASE in Vercel and make sure the backend is deployed.');
      } else if (err.response.status === 401) {
        setError('Invalid phone number or password.');
      } else {
        setError(err.response.data?.error || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="soft-page flex items-center justify-center py-12 px-4">
      <div className="auth-panel">
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
          <h2 className="mt-6 text-3xl font-bold text-slate-950 tracking-tight">Login</h2>
          <p className="mt-2 text-sm text-slate-600">Log in with your phone number and password.</p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-5">
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

          {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <div className="text-center">
          <Link to="/register" className="text-sm font-medium text-teal-700 hover:text-teal-800">
            New user? Create account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
