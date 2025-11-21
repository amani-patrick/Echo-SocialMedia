import { useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { CommentThread } from './CommentThread.jsx';

export const PostCard = ({ post, onReact, onComment }) => {
  const { profile } = useAuth();
  const [comment, setComment] = useState('');
  const [showComposer, setShowComposer] = useState(false);
  const [commentVersion, setCommentVersion] = useState(0);

  const displayName = useMemo(() => {
    if (post.author?.username) return post.author.username;
    if (profile && post.author?.userId === profile._id) return profile.username;
    return 'EchoSols friend';
  }, [post.author, profile]);

  const handleComment = async (event) => {
    event.preventDefault();
    if (!comment.trim()) return;
    await onComment(comment, post._id);
    setComment('');
    setShowComposer(false);
    setCommentVersion((prev) => prev + 1);
  };

  return (
    <article className="card" style={{ marginBottom: '1rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div>
          <strong>{displayName}</strong>
          <p style={{ margin: 0, color: '#64748b' }}>{new Date(post.createdAt).toLocaleString()}</p>
        </div>
        <span className="chip">{post.privacy?.toUpperCase()}</span>
      </header>
      <p style={{ fontSize: '1.05rem' }}>{post.content}</p>
      {post.tags?.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {post.tags.map(tag => (
            <span key={tag} className="chip" style={{ background: '#dbeafe' }}>
              #{tag}
            </span>
          ))}
        </div>
      )}
      <footer style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div className="toolbar">
          <button type="button" onClick={() => onReact(post._id, 'like')}>👍 Like</button>
          <button type="button" onClick={() => onReact(post._id, 'love')}>❤️ React</button>
          <button type="button" onClick={() => setShowComposer((prev) => !prev)}>
            💬 Comment
          </button>
        </div>
        {showComposer && (
          <form onSubmit={handleComment} style={{ flex: 1 }}>
            <input
              placeholder="Write a friendly comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </form>
        )}
        <CommentThread key={`${post._id}-${commentVersion}`} postId={post._id} />
      </footer>
    </article>
  );
};

