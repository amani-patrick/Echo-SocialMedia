import { useState } from 'react';

export const PostComposer = ({ onSubmit, disabled }) => {
  const [content, setContent] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!content.trim()) return;
    await onSubmit(content);
    setContent('');
  };

  return (
    <form className="card" onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
      <textarea
        rows={3}
        placeholder="Share something new..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <div style={{ marginTop: '0.75rem', textAlign: 'right' }}>
        <button type="submit" disabled={disabled}>Post</button>
      </div>
    </form>
  );
};

