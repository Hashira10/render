import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Snackbar,
    Alert,
    Box,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
// Получаем csrftoken
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
}

const Profile = () => {
    const [currentUsername, setCurrentUsername] = useState("");
    const [newUsername, setNewUsername] = useState("");
    const [usernameMessage, setUsernameMessage] = useState("");
    const [usernameError, setUsernameError] = useState("");

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [passwordMessage, setPasswordMessage] = useState("");

    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [message, setMessage] = useState({ text: "", severity: "info" });  // Инициализация переменной message

    // Загружаем текущий username при монтировании
    useEffect(() => {
        axios
            .get(`${API_BASE_URL}/current-user/`, { withCredentials: true })
            .then((res) => {
                setCurrentUsername(res.data.username);
            })
            .catch(() => {
                setCurrentUsername("Unknown");
            });
    }, []);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setPasswordError("New password and confirmation do not match.");
            return;
        }

        try {
            const csrfToken = getCookie("csrftoken");

            const response = await axios.post(
                `${API_BASE_URL}/change-password/`,
                {
                    current_password: currentPassword,
                    new_password: newPassword,
                    confirm_password: confirmPassword,
                },
                {
                    withCredentials: true,
                    headers: {
                        "X-CSRFToken": csrfToken,
                    },
                }
            );

            setPasswordMessage(response.data.message);
            setPasswordError("");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setMessage({ text: response.data.message, severity: "success" });  // Устанавливаем сообщение для Snackbar
            setOpenSnackbar(true);
        } catch (err) {
            setPasswordMessage("");
            if (err.response?.data?.message) {
                setPasswordError(err.response.data.message);
            } else {
                setPasswordError("Error: Unable to change password.");
            }
            setMessage({ text: passwordError || "Password change failed", severity: "error" });  // Сообщение об ошибке
            setOpenSnackbar(true);
        }
    };

    const handleUsernameChange = async (e) => {
        e.preventDefault();
        try {
            const csrfToken = getCookie("csrftoken");

            const response = await axios.patch(
                `${API_BASE_URL}/change-username/`,
                { new_username: newUsername },
                {
                    withCredentials: true,
                    headers: {
                        "X-CSRFToken": csrfToken,
                    },
                }
            );

            setUsernameMessage(response.data.message);
            setUsernameError("");
            setCurrentUsername(response.data.username);
            setNewUsername("");
            setMessage({ text: response.data.message, severity: "success" });  // Устанавливаем сообщение для Snackbar
            setOpenSnackbar(true);
        } catch (err) {
            setUsernameMessage("");
            if (err.response?.data?.message) {
                setUsernameError(err.response.data.message);
            } else {
                setUsernameError("Error: Unable to change username.");
            }
            setMessage({ text: usernameError || "Username change failed", severity: "error" });  // Сообщение об ошибке
            setOpenSnackbar(true);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ marginTop: 4, marginBottom: 6 }}>
        <Paper
            elevation={3}
            sx={{
                padding: 4,
                borderRadius: 3,
                
                color: '#25344F',
            }}
        >
            <Typography
                variant="h5"
                gutterBottom
                sx={{ textAlign: 'center', marginBottom: 4, color: '#25344F' }}
            >
                Profile Settings
            </Typography>

            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                }}
            >
                {/* Change Password */}
                <Box sx={{ flex: 1, minWidth: '300px', marginRight: 4 }}>
                    <form onSubmit={handlePasswordChange}>
                        <Typography
                            variant="h6"
                            sx={{
                                marginBottom: 3,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                color: '#25344F',
                            }}
                        >
                            <LockIcon fontSize="small" />
                            Change Password
                        </Typography>

                        {['Current Password', 'New Password', 'Confirm New Password'].map(
                            (label, index) => (
                                <TextField
                                    key={label}
                                    label={label}
                                    type="password"
                                    value={
                                        index === 0
                                            ? currentPassword
                                            : index === 1
                                            ? newPassword
                                            : confirmPassword
                                    }
                                    onChange={(e) =>
                                        index === 0
                                            ? setCurrentPassword(e.target.value)
                                            : index === 1
                                            ? setNewPassword(e.target.value)
                                            : setConfirmPassword(e.target.value)
                                    }
                                    fullWidth
                                    required
                                    InputLabelProps={{
                                        sx: { fontSize: '0.9rem', color: '#25344F' },
                                    }}
                                    sx={{
                                        marginBottom: 2,
                                        maxWidth: '400px',
                                        '& .MuiInputBase-root': {
                                            height: '45px',
                                            backgroundColor: '#fff',
                                        },
                                    }}
                                />
                            )
                        )}

                        {passwordError && (
                            <Typography sx={{ color: '#632024' }}>{passwordError}</Typography>
                        )}
                        {passwordMessage && (
                            <Typography sx={{ color: '#25344F' }}>{passwordMessage}</Typography>
                        )}

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            sx={{
                                marginTop: 2,
                                fontSize: '0.875rem',
                                padding: '6px 12px',
                                backgroundColor: '#617891',
                                '&:hover': {
                                    backgroundColor: '#4f6174',
                                },
                                color: '#fff',
                                maxWidth: '400px',
                            }}
                        >
                            Change Password
                        </Button>
                    </form>
                </Box>

                {/* Change Username */}
                <Box sx={{ flex: 1, minWidth: '300px' }}>
                    <Typography
                        variant="h6"
                        sx={{
                            marginBottom: 3,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            color: '#25344F',
                        }}
                    >
                        <PersonIcon fontSize="small" />
                        Change Username
                    </Typography>

                    <Typography variant="body1" gutterBottom sx={{ color: '#25344F' }}>
                        Current username: {currentUsername || 'Unknown'}
                    </Typography>

                    <form onSubmit={handleUsernameChange}>
                        <TextField
                            label="New Username"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            fullWidth
                            required
                            InputLabelProps={{
                                sx: { fontSize: '0.9rem', color: '#25344F' },
                            }}
                            sx={{
                                marginBottom: 2,
                                maxWidth: '400px',
                                '& .MuiInputBase-root': {
                                    height: '45px',
                                    backgroundColor: '#fff',
                                },
                            }}
                        />

                        {usernameError && (
                            <Typography sx={{ color: '#632024' }}>{usernameError}</Typography>
                        )}
                        {usernameMessage && (
                            <Typography sx={{ color: '#25344F' }}>{usernameMessage}</Typography>
                        )}

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            sx={{
                                marginTop: 2,
                                fontSize: '0.875rem',
                                padding: '6px 12px',
                                backgroundColor: '#617891',
                                '&:hover': {
                                    backgroundColor: '#4f6174',
                                },
                                color: '#fff',
                                maxWidth: '400px',
                            }}
                        >
                            Change Username
                        </Button>
                    </form>
                </Box>
            </Box>
        </Paper>

        <Snackbar
            open={openSnackbar}
            autoHideDuration={3000}
            onClose={() => setOpenSnackbar(false)}
        >
            <Alert severity={message.severity}>{message.text}</Alert>
        </Snackbar>
    </Container>
    );
};

export default Profile;