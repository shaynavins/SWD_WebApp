import React, { useState, useEffect } from 'react';

export default function Viewer() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [username, setUsername] = useState('');
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUsername(payload.username);
      } catch (e) {
        console.error('Error decoding token:', e);
      }
    }
  }, []);

  const fetchPosts = async (pageNum) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/api/posts?page=${pageNum}`);
      const data = await res.json();
      if (res.ok) {
        setPosts(prevPosts => pageNum === 1 ? data.posts : [...prevPosts, ...data.posts]);
        setHasMore(data.hasMore);
      } else {
        setError(data.error || 'Failed to fetch posts');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  const handleLike = async (postId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/post/${postId}/like`, {
        method: 'PUT',
      });
      if (res.ok) {
        setPosts(posts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
      }
    } catch (err) {
      console.error('Failed to like post', err);
    }
  };

  const handleComment = async (postId) => {
    if (!commentText.trim()) return;

    try {
      const res = await fetch('http://localhost:8080/api/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId, username, text: commentText }),
      });

      if (res.ok) {
        // Refetch all posts to show the new comment for simplicity
        // A better implementation would update the specific post's comments
        fetchPosts(1); 
        setPage(1);
        setCommentText('');
      } else {
        const data = await res.json();
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error('Failed to add comment', err);
    }
  };

  const loadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  return (
    <div>
      <h2>Feed</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {posts.map(post => (
        <div key={post.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
          <h3>{post.title}</h3>
          <p>by <em>{post.username}</em></p>
          <p>{post.body}</p>
          {post.imageUrl && (
            <img 
              src={`http://localhost:8080${post.imageUrl}`} 
              alt={post.title} 
              style={{ maxWidth: '100%', maxHeight: '400px' }}
            />
          )}
          <p>Likes: {post.likes}</p>
          <button onClick={() => handleLike(post.id)}>Like</button>

          <div>
            <h4>Comments</h4>
            {post.comments && post.comments.map(comment => (
              <p key={comment.id}><strong>{comment.username}:</strong> {comment.text}</p>
            ))}
            <div>
              <input 
                type="text" 
                placeholder="Add a comment"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
              />
              <button onClick={() => handleComment(post.id)}>Comment</button>
            </div>
          </div>
        </div>
      ))}

      {loading && <p>Loading posts...</p>}
      
      {!loading && hasMore && (
        <button onClick={loadMore}>Load More</button>
      )}

      {!hasMore && <p>No more posts.</p>}
    </div>
  );
}
  