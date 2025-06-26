import React, { useEffect, useState, useRef, useCallback } from "react";

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
            <div>
        <h2>Subscribe to:</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <ul>
            {posters.map((username) => (
            <li key={username}>
                {username}
                <button onClick={() => handleSubscribe(username)}>
                </button> 
            </li>
            
            ))}
        </ul>
        </div>
    );
}
