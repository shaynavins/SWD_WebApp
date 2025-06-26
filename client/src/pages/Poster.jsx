import React, { useState, useEffect } from "react";

export default function Poster() {
  const [username, setUsername] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [image, setImage] = useState(null);
  const [scheduledTime, setScheduledTime] = useState("");
  const [message, setMessage] = useState("");
  const [posts, setPosts] = useState([]);

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
    <div>
      <h2>Create a New Post</h2>
      {username && <p>Welcome, {username}!</p>}

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Post title"
      /><br />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Post body"
      /><br />
      <input 
        type="file" 
        onChange={(e) => setImage(e.target.files[0])} 
      /><br />
      <input
        type="datetime-local"
        value={scheduledTime}
        onChange={e => setScheduledTime(e.target.value)}
        style={{ marginBottom: 10 }}
      />
      <label style={{ marginLeft: 8 }}>Scheduled Time (optional)</label><br />
      <button onClick={createPost}>Create Post</button>

      {message && <p>{message}</p>}

      <h3>Your Posts</h3>
      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        <ul>
          {posts.map((post) => (
            <li key={post.id}>
              <strong>{post.title}</strong><br />
              {post.body}
              {post.scheduled_time && (
                <div style={{ color: "#888", fontSize: 13, marginBottom: 4 }}>
                  Scheduled for: {new Date(post.scheduled_time).toLocaleString()}
                </div>
              )}
              {post.imageUrl && <img src={`http://localhost:8080${post.imageUrl}`} alt={post.title} style={{maxWidth: '200px'}} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
