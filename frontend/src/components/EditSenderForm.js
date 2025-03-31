import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from '../config';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  Grid,
} from "@mui/material";

const EditSenderForm = () => {
  const { senderId } = useParams();
  const navigate = useNavigate();
  const [senderData, setSenderData] = useState({
    smtp_username: "",
    smtp_host: "",
    smtp_port: "",
    smtp_password: "",
  });
  const [message, setMessage] = useState({ text: "", severity: "info" });
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/senders/${senderId}/`)
      .then((response) => {
        setSenderData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching sender data:", error);
        setMessage({ text: "Error fetching sender data", severity: "error" });
        setOpenSnackbar(true);
      });
  }, [senderId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSenderData({ ...senderData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .put(`${API_BASE_URL}/api/senders/${senderId}/`, senderData)
      .then(() => {
        setMessage({ text: "Sender updated successfully!", severity: "success" });
        setOpenSnackbar(true);
        setTimeout(() => navigate("/dashboard/senders"), 1500);
      })
      .catch((error) => {
        console.error("Error updating sender:", error);
        setMessage({ text: "Failed to update sender", severity: "error" });
        setOpenSnackbar(true);
      });
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 3, marginTop: 4 }}>
        <Typography variant="h5" gutterBottom>
          Edit Sender
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="SMTP Username"
                fullWidth
                name="smtp_username"
                value={senderData.smtp_username}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="SMTP Host"
                fullWidth
                name="smtp_host"
                value={senderData.smtp_host}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="SMTP Port"
                type="number"
                fullWidth
                name="smtp_port"
                value={senderData.smtp_port}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="SMTP Password"
                type="password"
                fullWidth
                name="smtp_password"
                value={senderData.smtp_password}
                onChange={handleChange}
                required
              />
            </Grid>

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
                Save Changes
              </Button>
            </Grid>

            <Grid item xs={6}>
              <Button 
                variant="outlined" 
                sx={{ 
                  width: "100%",
                  borderColor: "#011843", 
                  color: "#011843",
                  "&:hover": { backgroundColor: "#011843", color: "#fff" }
                }} 
                onClick={() => navigate("/dashboard/senders")}
              >
                Cancel
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

export default EditSenderForm;
