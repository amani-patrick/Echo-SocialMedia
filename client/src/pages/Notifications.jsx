import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useApi } from '../hooks/useApi.js';

export const Notifications = () => {
  const { profile } = useAuth();
  const api = useApi();
  const [items, setItems] = useState([]);

  const fetchNotifications = async () => {
    if (!profile?._id) return;
    const { data } = await api.get(`/api/notifications/user/${profile._id}`);
    setItems(data);
  };

  useEffect(() => {
    fetchNotifications();
  }, [profile?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const markRead = async (id) => {
    await api.put(`/api/notifications/${id}/read`);
    await fetchNotifications();
  };

  return (
    <div className="card">
      <h2>Notifications Center</h2>
      <button type="button" onClick={fetchNotifications}>Refresh</button>
      <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {items.length === 0 && <p>All caught up 🎉</p>}
        {items.map((notif) => (
          <div key={notif._id} style={{ padding: '0.75rem', borderRadius: '12px', background: notif.read ? '#f8fafc' : '#e0f2fe' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>{notif.type}</strong>
              {!notif.read && (
                <button type="button" onClick={() => markRead(notif._id)}>
                  Mark as read
                </button>
              )}
            </div>
            <p>{notif.message}</p>
            <small>{new Date(notif.createdAt).toLocaleString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
};

