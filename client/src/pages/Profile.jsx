import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';

export const Profile = () => {
  const { profile, refreshProfile, authAxios } = useAuth();
  const [form, setForm] = useState({ bio: '', avatar: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        bio: profile.bio || '',
        avatar: profile.avatar || ''
      });
    }
  }, [profile]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await authAxios.put('/api/users/me', form);
      await refreshProfile();
    } catch (err) {
      console.error('Failed to update profile', err);
    } finally {
      setSaving(false);
    }
  };

  if (!profile) {
    return <p>Loading profile...</p>;
  }

  return (
    <div className="card">
      <h2>Profile</h2>
      <p><strong>Username:</strong> {profile.username}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label htmlFor="bio">Bio</label>
        <textarea id="bio" name="bio" rows={3} value={form.bio} onChange={handleChange} />

        <label htmlFor="avatar">Avatar URL</label>
        <input id="avatar" name="avatar" value={form.avatar} onChange={handleChange} />

        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  );
};

