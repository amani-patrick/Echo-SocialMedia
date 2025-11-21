import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useSocket } from '../hooks/useSocket.js';
import { NotificationDrawer } from './NotificationDrawer.jsx';

const navLinks = [
  { to: '/', label: 'Feed' },
  { to: '/profile', label: 'Profile' },
  { to: '/friends', label: 'Friends' },
  { to: '/notifications', label: 'Notifications' }
];

export const AppShell = ({ children }) => {
  const { pathname } = useLocation();
  const { logout, profile } = useAuth();
  const { connectionState } = useSocket();

  return (
    <div className="app-shell">
      <header className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0 }}>EchoSols</h1>
          <small>Realtime social platform</small>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span>
            {profile?.username || 'Guest'}
            {' • '}
            <strong>{connectionState}</strong>
          </span>
          <button type="button" onClick={logout}>Logout</button>
        </div>
      </header>

      <main className="layout">
        <aside className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                background: pathname === link.to ? '#dbeafe' : 'transparent',
                fontWeight: pathname === link.to ? 700 : 500
              }}
            >
              {link.label}
            </Link>
          ))}
        </aside>

        <section>{children}</section>

        <NotificationDrawer />
      </main>
    </div>
  );
};

