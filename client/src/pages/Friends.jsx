import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useApi } from '../hooks/useApi.js';

export const Friends = () => {
  const { profile } = useAuth();
  const api = useApi();
  const [friends, setFriends] = useState([]);
  const [friendProfiles, setFriendProfiles] = useState({});
  const [pending, setPending] = useState({ sent: [], received: [] });
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadFriends = async () => {
    if (!profile?._id) return;
    const [friendsRes, pendingRes] = await Promise.all([
      api.get(`/api/friends/${profile._id}`),
      api.get(`/api/friends/pending/${profile._id}`)
    ]);
    setFriends(friendsRes.data);
    setPending(pendingRes.data);

    const details = await Promise.all(
      friendsRes.data.map(async (id) => {
        try {
          const { data } = await api.get(`/api/users/${id}/profile`);
          return { id, ...data };
        } catch {
          return { id, username: id };
        }
      })
    );
    setFriendProfiles(Object.fromEntries(details.map((item) => [item.id, item])));
  };

  useEffect(() => {
    loadFriends();
  }, [profile?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const searchUsers = async () => {
    if (!search.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get(`/api/users/search?q=${encodeURIComponent(search)}`);
      setResults(data);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setLoading(false);
    }
  };

  const sendRequest = async (userId) => {
    await api.post('/api/friends/request', { to: userId });
    await loadFriends();
  };

  const acceptRequest = async (requestId) => {
    await api.post('/api/friends/respond', { requestId, action: 'accept' });
    await loadFriends();
  };

  const friendCards = useMemo(() => friends.map((friendId) => friendProfiles[friendId] || { id: friendId }), [friendProfiles, friends]);

  return (
    <div className="card">
      <h2>Connections</h2>
      <div className="card" style={{ background: '#f8fafc', marginBottom: '1rem' }}>
        <h3>Find friends</h3>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input
            placeholder="Search by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
          />
          <button type="button" onClick={searchUsers} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
        {results.length > 0 && (
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {results.map((user) => (
              <div key={user._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{user.username}</strong>
                  <p style={{ margin: 0, color: '#64748b' }}>{user.bio}</p>
                </div>
                <button type="button" onClick={() => sendRequest(user._id)}>
                  Add friend
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <h3>Pending received</h3>
          {pending.received?.length === 0 && <p>No pending requests.</p>}
          {pending.received?.map((request) => (
            <div key={request._id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>{request.from}</span>
              <button type="button" onClick={() => acceptRequest(request._id)}>
                Accept
              </button>
            </div>
          ))}
        </div>
        <div style={{ flex: 1 }}>
          <h3>Pending sent</h3>
          {pending.sent?.length === 0 && <p>No outbound requests.</p>}
          {pending.sent?.map((request) => (
            <div key={request._id} className="chip">
              Waiting • {request.to}
            </div>
          ))}
        </div>
      </div>

      <h3 style={{ marginTop: '1.5rem' }}>Friends</h3>
      {friendCards.length === 0 && <p>No friends yet.</p>}
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {friendCards.map((friend) => (
          <div key={friend.id} className="card" style={{ padding: '0.85rem 1rem' }}>
            <strong>{friend.username || friend.id}</strong>
            {friend.bio && <p style={{ margin: 0 }}>{friend.bio}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

