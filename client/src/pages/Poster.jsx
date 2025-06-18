import React, { useState, useEffect } from "react";

export default function Poster() {
  const [username, setUsername] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");
  const [posts, setPosts] = useState([]);

  // Extract username from JWT token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUsername(payload.username);
      } catch (error) {
        console.error("Error parsing token:", error);
        setMessage("❌ Authentication error. Please login again.");
      }
    } else {
      setMessage("❌ No authentication token found. Please login.");
    }
  }, []);

  const createPost = async () => {
    if (!title || !body) {
      setMessage("❌ Title and body required.");
      return;
    }

    if (!username) {
      setMessage("❌ User not authenticated.");
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/api/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, title, body }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ Post created: ${data.post.title}`);
        setTitle("");
        setBody("");
        fetchPosts();
      } else {
        setMessage(`❌ Error: ${data.error || "Failed to create post"}`);
      }
    } catch (err) {
      console.error("Post error:", err);
      setMessage("❌ Network error.");
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
      setMessage("❌ Could not load posts.");
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
