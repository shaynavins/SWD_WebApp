import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("poster");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async () => {
    if (!username || !password) {
      setError("Username and password are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8080/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(`Successfully signed up as ${data.username}!`);
        setUsername("");
        setPassword("");
        setRole("poster");
      } else {
        setError(data.error || "Signup failed");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("Network error - please check your connection and try again");
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigate("/login");
  };

  return (
    <div style={{ minHeight: '100vh', background: '#181c24', color: '#f5f6fa', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#23283a', borderRadius: 14, boxShadow: '0 4px 24px #0008', padding: 36, minWidth: 320, maxWidth: 350, width: '100%' }}>
        <h2 style={{ marginBottom: 28, fontWeight: 700, letterSpacing: 1, textAlign: 'center', color: '#f5f6fa' }}>Signup</h2>
        <input 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          placeholder="Username" 
          disabled={loading}
          style={{ marginBottom: 14, padding: 12, borderRadius: 8, border: '1.5px solid #444', color: '#f5f6fa', background: '#23283a', width: '100%', outline: 'none', fontSize: 16 }}
        />
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Password" 
          disabled={loading}
          style={{ marginBottom: 14, padding: 12, borderRadius: 8, border: '1.5px solid #444', color: '#f5f6fa', background: '#23283a', width: '100%', outline: 'none', fontSize: 16 }}
        />
        <select 
          value={role} 
          onChange={e => setRole(e.target.value)}
          disabled={loading}
          style={{ marginBottom: 18, padding: 12, borderRadius: 8, border: '1.5px solid #444', color: '#f5f6fa', background: '#23283a', width: '100%', outline: 'none', fontSize: 16 }}
        >
          <option value="poster">Poster</option>
          <option value="viewer">Viewer</option>
        </select>
        <button onClick={handleSignup} disabled={loading} style={{ padding: '10px 0', borderRadius: 8, background: '#4f8cff', color: '#fff', border: 'none', cursor: 'pointer', width: '100%', fontWeight: 600, fontSize: 16, marginBottom: 14, transition: 'background 0.2s' }}
          onMouseOver={e => e.currentTarget.style.background = '#2563eb'}
          onMouseOut={e => e.currentTarget.style.background = '#4f8cff'}>
          {loading ? "Signing up..." : "Signup"}
        </button>
        <button onClick={navigateToLogin} style={{ background: 'none', color: '#4f8cff', border: 'none', cursor: 'pointer', textDecoration: 'underline', marginTop: 8, fontWeight: 500, fontSize: 15, display: 'block', marginLeft: 'auto', marginRight: 'auto' }}>
          Already have an account? Login here
        </button>
        {error && <p style={{ color: "#ff4f4f", marginBottom: 10, textAlign: 'center' }}>{error}</p>}
      </div>
    </div>
  );
}
