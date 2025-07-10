import React, { useEffect, useState } from "react";

export default function Subscribe() {
    const [posters, setPosters] = useState([]);
    const [error, setError] = useState("");
    
    useEffect(() => {
        const fetchPosters = async () => {
            try {
                const res = await fetch("http://localhost:8080/api/posters");
                const data = await res.json();
                if (res.ok) {
                  setPosters(data.posters);
                } else {
                  setError(data.error || "Failed to fetch posters");
                }
              } catch (err) {
                setError("Network error");
              }
        };
        fetchPosters();
    }, [])

    const handleSubscribe = async (username) => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("You must be logged in to subscribe.");
            return;
        }

    try {
        const res = await fetch("http://localhost:8080/api/subscribe", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ posterUsername: username }),
        });

        const data = await res.json();
        if (res.ok) {
            alert(data.message);
        } else {
            setError(data.error || "Failed to subscribe.");
        }
    } catch (err) {
        setError("Network error during subscription.");
    }
    };
    return (
      <div style={{ minHeight: '100vh', background: '#181c24', color: '#f5f6fa', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#23283a', borderRadius: 14, boxShadow: '0 4px 24px #0008', padding: 36, minWidth: 320, maxWidth: 350, width: '100%' }}>
          <h2 style={{ marginBottom: 28, fontWeight: 700, letterSpacing: 1, textAlign: 'center', color: '#f5f6fa' }}>All Poster Usernames</h2>
          {error && <p style={{ color: '#ff4f4f', marginBottom: 10, textAlign: 'center' }}>{error}</p>}
          <ul style={{ padding: 0, listStyle: 'none', width: '100%' }}>
            {posters.map((username) => (
              <li key={username} style={{ background: '#23283a', border: '1px solid #333', borderRadius: 8, padding: 12, marginBottom: 12, color: '#f5f6fa', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px #0008' }}>
                <span>{username}</span>
                <button onClick={() => handleSubscribe(username)} style={{ padding: '8px 18px', borderRadius: 8, background: '#4f8cff', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: 15, transition: 'background 0.2s' }}
                  onMouseOver={e => e.currentTarget.style.background = '#2563eb'}
                  onMouseOut={e => e.currentTarget.style.background = '#4f8cff'}>
                  Subscribe
                </button> 
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
}
