import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { extractErrorMessage } from '../utils/error.js';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ usernameOrEmail: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(form);
      navigate('/');
    } catch (err) {
      setError(extractErrorMessage(err, 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
      <form className="card" style={{ width: '360px' }} onSubmit={handleSubmit}>
        <h2>Welcome back</h2>
        <p>Please sign in to continue.</p>
        <label htmlFor="usernameOrEmail">Username or Email</label>
        <input
          required
          id="usernameOrEmail"
          name="usernameOrEmail"
          value={form.usernameOrEmail}
          onChange={handleChange}
          placeholder="jane@example.com"
        />
        <label htmlFor="password">Password</label>
        <input
          required
          type="password"
          id="password"
          name="password"
          value={form.password}
          onChange={handleChange}
        />
        {error && <p style={{ color: 'tomato' }}>{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
        <p style={{ textAlign: 'center' }}>
          Need an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
};

