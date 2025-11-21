import { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi.js';
import { useAuth } from '../hooks/useAuth.js';

const typeCopy = {
  like: 'Reaction',
  comment: 'Comment',
  follow: 'Friend request',
  system: 'Update',
  reaction: 'Reaction'
};

export const NotificationDrawer = () => {
  const api = useApi();
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!profile?._id) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/api/notifications/user/${profile._id}`);
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10_000);
    return () => clearInterval(interval);
  }, [profile?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <aside className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <h3 style={{ margin: 0 }}>Notifications</h3>
        <button type="button" onClick={fetchNotifications} disabled={loading}>
          Refresh
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '60vh', overflowY: 'auto' }}>
        {notifications.length === 0 && <p style={{ color: '#64748b' }}>No notifications yet.</p>}
        {notifications.map((notif) => (
          <div key={notif._id} style={{ padding: '0.5rem', borderRadius: '10px', background: '#f8fafc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>{typeCopy[notif.type] || notif.type}</strong>
              <span className="chip" style={{ background: '#e0f2fe' }}>{notif.type}</span>
            </div>
            <p style={{ margin: '0.25rem 0' }}>{notif.message}</p>
            <small>{new Date(notif.createdAt).toLocaleString()}</small>
          </div>
        ))}
      </div>
    </aside>
  );
};

