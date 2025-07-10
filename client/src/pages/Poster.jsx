import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function Poster() {
  const [username, setUsername] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [image, setImage] = useState(null);
  const [scheduledTime, setScheduledTime] = useState("");
  const [message, setMessage] = useState("");
  const [posts, setPosts] = useState([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUsername(payload.username);
      } catch (error) {
        console.error("Error parsing token:", error);
        setMessage("Authentication error. Please login again.");
      }
    } else {
      setMessage("No authentication token found. Please login.");
    }
  }, []);

  const createPost = async () => {
    if (!title || !body) {
      setMessage("Title and body required.");
      return;
    }

    if (!username) {
      setMessage("User not authenticated.");
      return;
    }

    const formData = new FormData();
    formData.append("username", username);
    formData.append("title", title);
    formData.append("body", body);
    if (image) {
      formData.append("image", image);
    }
    if (scheduledTime) {
      formData.append("scheduled_time", scheduledTime);
    }

    try {
      const res = await fetch("http://localhost:8080/api/post", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`Post created: ${data.post.title}`);
        setTitle("");
        setBody("");
        setImage(null);
        setScheduledTime("");
        fetchPosts();
        queryClient.invalidateQueries(["posts"]);
      } else {
        setMessage(`Error: ${data.error || "Failed to create post"}`);
      }
    } catch (err) {
      console.error("Post error:", err);
      setMessage("Network error.");
    }
  };

  const fetchPosts = async () => {
    if (!username) return;

    try {
      const res = await fetch(`http://localhost:8080/api/post/${username}`);
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
      setMessage("Could not load posts.");
    }
  };

  useEffect(() => {
    if (username) {
      fetchPosts();
    }
  }, [username]);

  return (
    <div style={{ minHeight: '100vh', background: '#181c24', color: '#f5f6fa', padding: 24 }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div style={{ background: '#23283a', borderRadius: 10, boxShadow: '0 2px 8px #0008', padding: 28, marginBottom: 32 }}>
          <h2 style={{ textAlign: 'center', marginBottom: 18, color: '#f5f6fa' }}>Create a New Post</h2>
          {username && <p style={{ color: '#b3b8c5', marginBottom: 16 }}>Welcome, {username}!</p>}

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title"
            style={{ marginBottom: 10, padding: 10, borderRadius: 6, border: '1px solid #444', width: '100%', background: '#23283a', color: '#f5f6fa' }}
          /><br />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Post body"
            style={{ marginBottom: 10, padding: 10, borderRadius: 6, border: '1px solid #444', width: '100%', background: '#23283a', color: '#f5f6fa' }}
          /><br />
          <input 
            type="file" 
            onChange={(e) => setImage(e.target.files[0])} 
            style={{ marginBottom: 10 }}
          /><br />
          <input
            type="datetime-local"
            value={scheduledTime}
            onChange={e => setScheduledTime(e.target.value)}
            style={{ marginBottom: 10, padding: 8, borderRadius: 6, border: '1px solid #444', background: '#23283a', color: '#f5f6fa' }}
          />
          <label style={{ marginLeft: 8, color: '#b3b8c5' }}>Scheduled Time (optional)</label><br />
          <button onClick={createPost} style={{ padding: '10px 0', borderRadius: 6, background: '#4f8cff', color: '#fff', border: 'none', cursor: 'pointer', width: '100%', fontWeight: 500, fontSize: 16, marginTop: 10, marginBottom: 10, transition: 'background 0.2s' }}
            onMouseOver={e => e.currentTarget.style.background = '#2563eb'}
            onMouseOut={e => e.currentTarget.style.background = '#4f8cff'}>
            Create Post
          </button>

          {message && <p style={{ color: message.startsWith('Post created') ? '#4f8cff' : '#ff4f4f', marginBottom: 10, textAlign: 'center' }}>{message}</p>}
        </div>

        <h3 style={{ marginTop: 0, marginBottom: 16, fontWeight: 600, color: '#f5f6fa' }}>Your Posts</h3>
        {posts.length === 0 ? (
          <p style={{ color: '#b3b8c5' }}>No posts yet.</p>
        ) : (
          <ul style={{ padding: 0, listStyle: 'none' }}>
            {posts.map((post) => (
              <li key={post.id} style={{ background: '#23283a', border: '1px solid #333', borderRadius: 8, padding: 16, marginBottom: 16, color: '#f5f6fa', boxShadow: '0 1px 4px #0008' }}>
                <strong style={{ color: '#f5f6fa', fontSize: 16 }}>{post.title}</strong><br />
                <span style={{ color: '#b3b8c5' }}>{post.body}</span>
                {post.scheduled_time && (
                  <div style={{ color: "#b3b8c5", fontSize: 13, marginBottom: 4 }}>
                    Scheduled for: {new Date(post.scheduled_time).toLocaleString()}
                  </div>
                )}
                {post.imageUrl && <img src={`http://localhost:8080${post.imageUrl}`} alt={post.title} style={{maxWidth: '200px', display: 'block', margin: '10px 0', borderRadius: 6}} />}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
