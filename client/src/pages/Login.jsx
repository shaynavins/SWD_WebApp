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
    <div>
      <h2>Login</h2>
      <input 
        value={username} 
        onChange={(e) => setUsername(e.target.value)} 
        placeholder="Username" 
        disabled={loading}
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        placeholder="Password" 
        disabled={loading}
      />
      <button onClick={handleLogin} disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>

      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      {showSignup && (
        <button onClick={navigateToSignup}>
          New user? Sign up here
        </button>
      )}
    </div>
  );
}
