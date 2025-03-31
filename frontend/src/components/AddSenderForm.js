import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from '../config';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  IconButton,
  InputAdornment,
  Grid,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";


const AddSenderForm = () => {
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("");
  const [smtpUsername, setSmtpUsername] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [testEmail, setTestEmail] = useState(""); 
  const [message, setMessage] = useState({ text: "", severity: "info" });
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const senderData = {
      smtp_host: smtpHost,
      smtp_port: smtpPort,
      smtp_username: smtpUsername,
      smtp_password: smtpPassword,
    };

    try {
      await axios.post(`${API_BASE_URL}/api/senders/`, senderData);
      setMessage({ text: "Sender added successfully!", severity: "success" });
      setSmtpHost("");
      setSmtpPort("");
      setSmtpUsername("");
      setSmtpPassword("");
    } catch (error) {
      console.error("Error adding sender:", error);
      setMessage({ text: "Failed to add sender", severity: "error" });
    }
    setOpenSnackbar(true);
  };

  const handleSendTestEmail = async () => {
    if (!validateEmail(testEmail)) {
      setMessage({ text: "Invalid email address", severity: "error" });
      setOpenSnackbar(true);
      return;
    }
  
    try {
      await axios.post(`${API_BASE_URL}/api/send_test_email/`, {
        email: testEmail,
        smtp_host: smtpHost,
        smtp_port: smtpPort,
        smtp_username: smtpUsername,
        smtp_password: smtpPassword
      });
  
      setMessage({ text: "Test email sent successfully!", severity: "success" });
    } catch (error) {
      console.error("Error sending test email:", error);
      setMessage({ text: "Failed to send test email", severity: "error" });
    }
    setOpenSnackbar(true);
  };
  

  return (
    <Container maxWidth="sm" sx={{ marginBottom: 6 }}>
      <Paper elevation={3} sx={{ padding: 3, marginTop: 4 }}>
        <Typography variant="h5" gutterBottom>
          Add Sender
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="SMTP Host"
            fullWidth
            value={smtpHost}
            onChange={(e) => setSmtpHost(e.target.value)}
            required
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="SMTP Port"
            type="number"
            fullWidth
            value={smtpPort}
            onChange={(e) => setSmtpPort(e.target.value)}
            required
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="SMTP Username"
            fullWidth
            value={smtpUsername}
            onChange={(e) => setSmtpUsername(e.target.value)}
            required
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="SMTP Password"
            type={showPassword ? "text" : "password"}
            fullWidth
            value={smtpPassword}
            onChange={(e) => setSmtpPassword(e.target.value)}
            required
            sx={{ marginBottom: 3 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={toggleShowPassword} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Test Email"
            fullWidth
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            sx={{ marginBottom: 3 }}
          />

<Grid container spacing={2} sx={{ marginTop: 2 }}>
            <Grid item xs={6}>
              <Button 
                type="submit" 
                variant="contained" 
                sx={{ 
                  width: "100%",
                  background: "linear-gradient(135deg, #011843,rgb(127, 161, 220))",
                  color: "#fff",
                  "&:hover": { background: "linear-gradient(135deg, #01102c,rgb(137, 174, 216))" }
                }}
              >
                Add Sender
              </Button>
            </Grid>

            <Grid item xs={6}>
              <Button 
                variant="outlined"
                onClick={handleSendTestEmail}
                sx={{
                  width: "100%",
                  borderColor: "#011843",
                  color: "#011843",
                  "&:hover": { background: "linear-gradient(135deg, #011843, #bac8e0)", color: "#fff" },
                }}
              >
                Send Test Email
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)}>
        <Alert severity={message.severity} onClose={() => setOpenSnackbar(false)}>
          {message.text}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AddSenderForm;


