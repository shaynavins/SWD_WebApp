import React, { useState, useEffect } from 'react';
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from 'react-router-dom';

export default function Viewer() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [username, setUsername] = useState('');
  const [commentText, setCommentText] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

  const {
    data,
    error: queryError,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await fetch(`http://localhost:8080/api/posts?page=${pageParam}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasMore ? pages.length + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000,
  });

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
        setCommentText('');
        queryClient.invalidateQueries(["posts"]);
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
    <div style={{ minHeight: '100vh', background: '#181c24', color: '#f5f6fa', padding: 24 }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
          <button
            onClick={() => navigate('/subscribe')}
            style={{ padding: '8px 18px', borderRadius: 8, background: '#4f8cff', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: 15, transition: 'background 0.2s' }}
            onMouseOver={e => e.currentTarget.style.background = '#2563eb'}
            onMouseOut={e => e.currentTarget.style.background = '#4f8cff'}
          >
            Go to Subscribe Page
          </button>
        </div>
        <h2 style={{ textAlign: 'center', marginBottom: 30, letterSpacing: 1, fontWeight: 700, color: '#f5f6fa' }}>Feed</h2>
        {queryError && <p style={{ color: '#ff4f4f' }}>{queryError.message}</p>}
        {isLoading && <p>Loading posts...</p>}
        {isFetchingNextPage && <p>Loading more...</p>}
        {data?.pages?.flatMap(page => page.posts).map(post => (
          <div key={post.id} style={{ background: '#23283a', borderRadius: 10, boxShadow: '0 2px 8px #0008', padding: 24, marginBottom: 28 }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#f5f6fa' }}>{post.title}</h3>
            <p style={{ margin: '0 0 4px 0', color: '#b3b8c5' }}>by <em>{post.username}</em></p>
            <p style={{ margin: '0 0 8px 0' }}>{post.body}</p>
            {post.scheduled_time && (
              <div style={{ color: "#b3b8c5", fontSize: 13, marginBottom: 4 }}>
                Scheduled for: {new Date(post.scheduled_time).toLocaleString()}
              </div>
            )}
            {post.imageUrl && (
              <img
                src={`http://localhost:8080${post.imageUrl}`}
                alt={post.title}
                style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: 6, margin: '10px 0' }}
              />
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '10px 0' }}>
              <span>Likes: {post.likes}</span>
              <button
                onClick={() => handleLike(post.id)}
                style={{
                  padding: '4px 14px',
                  borderRadius: 5,
                  border: '1px solid #444',
                  background: '#23283a',
                  color: '#f5f6fa',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseOver={e => e.currentTarget.style.background = '#23283a'}
                onMouseOut={e => e.currentTarget.style.background = '#23283a'}
              >
                Like
              </button>
            </div>
            <div style={{ marginTop: 10 }}>
              <h4 style={{ margin: '10px 0 6px 0', color: '#b3b8c5' }}>Comments</h4>
              {post.comments && post.comments.map(comment => (
                <p key={comment.id} style={{ margin: '4px 0', color: '#f5f6fa' }}><strong>{comment.username}:</strong> {comment.text}</p>
              ))}
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <input
                  type="text"
                  placeholder="Add a comment"
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  style={{ flex: 1, padding: 6, borderRadius: 4, border: '1px solid #444', background: '#23283a', color: '#f5f6fa' }}
                />
                <button
                  onClick={() => handleComment(post.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 5,
                    border: '1px solid #444',
                    background: '#23283a',
                    color: '#f5f6fa',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseOver={e => e.currentTarget.style.background = '#23283a'}
                  onMouseOut={e => e.currentTarget.style.background = '#23283a'}
                >
                  Comment
                </button>
              </div>
            </div>
          </div>
        ))}
        {hasNextPage && !isLoading && (
          <button
            onClick={() => fetchNextPage()}
            style={{
              display: 'block',
              margin: '30px auto 0',
              padding: '10px 28px',
              borderRadius: 6,
              border: '1px solid #444',
              background: '#23283a',
              color: '#f5f6fa',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: 16,
              transition: 'background 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.background = '#23283a'}
            onMouseOut={e => e.currentTarget.style.background = '#23283a'}
          >
            Load More
          </button>
        )}
        {!hasNextPage && <p style={{ textAlign: 'center', color: '#b3b8c5', marginTop: 30 }}>No more posts.</p>}
      </div>
    </div>
  );
}
  