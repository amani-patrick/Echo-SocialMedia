import { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi.js';

export const CommentThread = ({ postId }) => {
  const api = useApi();
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const { data } = await api.get(`/api/comments/post/${postId}`);
        setComments(data);
      } catch (err) {
        console.error('Failed to load comments', err);
      }
    };
    fetchComments();
  }, [api, postId]);

  if (comments.length === 0) {
    return null;
  }

  return (
    <div style={{ marginTop: '0.75rem', borderTop: '1px solid #e5e7eb', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      {comments.map((comment) => (
        <div key={comment._id} style={{ display: 'flex', gap: '0.5rem' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: '#dbeafe',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 700
            }}
          >
            {(comment.author?.username || '??').slice(0, 2).toUpperCase()}
          </div>
          <div style={{ background: '#f0f2f5', borderRadius: '18px', padding: '0.6rem 0.85rem', flex: 1 }}>
            <strong style={{ display: 'block' }}>{comment.author?.username || 'EchoSols friend'}</strong>
            <span>{comment.content}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

