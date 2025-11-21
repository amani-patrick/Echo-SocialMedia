import { useCallback, useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi.js';
import { useAuth } from '../hooks/useAuth.js';
import { PostComposer } from '../components/PostComposer.jsx';
import { PostCard } from '../components/PostCard.jsx';

export const Feed = () => {
  const api = useApi();
  const { profile } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/posts');
      setPosts(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load posts', err);
      setError('Unable to load feed right now.');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleCreatePost = async (content) => {
    await api.post('/api/posts', { content, tags: [], privacy: 'public' });
    await fetchPosts();
  };

  const handleReact = async (postId, type) => {
    await api.post(`/api/posts/${postId}/reaction`, { type });
    await fetchPosts();
  };

  const handleComment = async (content, postId) => {
    await api.post('/api/comments', { content, post: postId, postAuthorId: posts.find(p => p._id === postId)?.author?.userId });
  };

  return (
    <div>
      <PostComposer onSubmit={handleCreatePost} disabled={!profile} />
      {error && <div className="alert alert--error">{error}</div>}
      {loading && <p>Loading feed...</p>}
      {!loading && posts.length === 0 && <p>No posts yet. Be the first to share something!</p>}
      {posts.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          onReact={handleReact}
          onComment={handleComment}
        />
      ))}
    </div>
  );
};

