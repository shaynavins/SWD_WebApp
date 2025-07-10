import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showSignup, setShowSignup] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      setErrorMsg("Username and password are required");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("http://localhost:8080/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        
        const payload = JSON.parse(atob(data.token.split(".")[1]));
        const role = payload.role;

        if (role === "poster") {
          navigate("/poster");
        } else if (role === "viewer") {
          navigate("/viewer");
        } else {
          setErrorMsg("Unknown role.");
        }
      } else {
        if (data.error === "Invalid login") {
          setErrorMsg("User not found.");
          setShowSignup(true);
        } else if (data.error === "Invalid password") {
          setErrorMsg("Wrong password.");
        } else {
          setErrorMsg(data.error || "Login failed");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMsg("Network error - please check your connection and try again");
    } finally {
      setLoading(false);
    }
  };

  const navigateToSignup = () => {
    navigate("/signup");
  };

  return (
    <div style={{ minHeight: '100vh', background: '#181c24', color: '#f5f6fa', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#23283a', borderRadius: 14, boxShadow: '0 4px 24px #0008', padding: 36, minWidth: 320, maxWidth: 350, width: '100%' }}>
        <h2 style={{ marginBottom: 28, fontWeight: 700, letterSpacing: 1, textAlign: 'center', color: '#f5f6fa' }}>Login</h2>
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
          style={{ marginBottom: 18, padding: 12, borderRadius: 8, border: '1.5px solid #444', color: '#f5f6fa', background: '#23283a', width: '100%', outline: 'none', fontSize: 16 }}
        />
        <button onClick={handleLogin} disabled={loading} style={{ padding: '10px 0', borderRadius: 8, background: '#4f8cff', color: '#fff', border: 'none', cursor: 'pointer', width: '100%', fontWeight: 600, fontSize: 16, marginBottom: 14, transition: 'background 0.2s' }}
          onMouseOver={e => e.currentTarget.style.background = '#2563eb'}
          onMouseOut={e => e.currentTarget.style.background = '#4f8cff'}>
          {loading ? "Logging in..." : "Login"}
        </button>
        <button onClick={navigateToSignup} style={{ background: 'none', color: '#4f8cff', border: 'none', cursor: 'pointer', textDecoration: 'underline', marginTop: 8, fontWeight: 500, fontSize: 15, display: 'block', marginLeft: 'auto', marginRight: 'auto' }}>
          New user? Sign up here
        </button>
        {errorMsg && <p style={{ color: "#ff4f4f", marginBottom: 10, textAlign: 'center' }}>{errorMsg}</p>}
      </div>
    </div>
  );
}
