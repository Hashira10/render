import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; 
import "./Auth.css"; 
import { API_BASE_URL } from '../config';

const Auth = ({ setIsAuthenticated }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [authStatus, setAuthStatus] = useState(null);
    const navigate = useNavigate(); // ✅ Initialize navigate for redirection

    // ✅ Signup function
    const handleSignup = async () => {
        try {
            const response = await axios.post(`${API_BASE_URL}/signup/`, { username, password }, { withCredentials: true });
            if (response.status === 201) {
                const { username, password } = response.data; // Extract credentials
                setAuthStatus(`Signup successful!\nUsername: ${username} Password: ${password} Please log in.`);
            }
        } catch (error) {
            setAuthStatus("Signup failed. Try a different username.");
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_BASE_URL}/token/`, {
                username,
                password
            }, { withCredentials: true });

            if (response.status === 200) {
                const { access, refresh } = response.data;

                // Сохраняем токены
                localStorage.setItem("access_token", access);
                localStorage.setItem("refresh_token", refresh);

                // Устанавливаем авторизацию по умолчанию для всех запросов
                axios.defaults.headers.common["Authorization"] = `Bearer ${access}`;

                setIsAuthenticated(true);
                navigate("/dashboard");
            }
        } catch (error) {
            setAuthStatus("Login failed. Please check your credentials.");
        }
    };

    return (
        <div className="auth-container">
            <h2>Authentication</h2>
            <form onSubmit={handleLogin} className="auth-inputs">
                <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)}
                       required/>
                <input type="password" placeholder="Password" value={password}
                       onChange={(e) => setPassword(e.target.value)} required/>
                <button type="submit" className="auth-button">Login</button>
            </form>
            <button onClick={handleSignup} className="auth-button signup">Sign Up</button>
            {authStatus && <p className="auth-status">{authStatus}</p>}
        </div>
    );
};

export default Auth;