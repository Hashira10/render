import React, { useState } from "react";
import axios from "axios";

const ChangePassword = () => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setError("New password and confirmation do not match.");
            return;
        }

        try {
            const response = await axios.post("http://127.0.0.1:8000/change-password/", {
                current_password: currentPassword,
                new_password: newPassword,
                confirm_password: confirmPassword,
            }, { withCredentials: true });

            setMessage(response.data.message);
            setError("");
        } catch (err) {
            setError("Error: Unable to change password. Please try again.");
        }
    };

    return (
        <div>
            <h2>Change Password</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Current Password:</label>
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>New Password:</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Confirm New Password:</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <div style={{ color: "red" }}>{error}</div>}
                {message && <div style={{ color: "green" }}>{message}</div>}
                <button type="submit">Change Password</button>
            </form>
        </div>
    );
};

export default ChangePassword;
