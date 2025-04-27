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

const EditRecipientForm = () => {
  const { recipientId } = useParams();
  const navigate = useNavigate();
  const [recipientData, setRecipientData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    position: "",
  });
  const [message, setMessage] = useState({ text: "", severity: "info" });
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/recipients/${recipientId}/`)
      .then((response) => {
        setRecipientData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching recipient data:", error);
        setMessage({ text: "Error fetching recipient data", severity: "error" });
        setOpenSnackbar(true);
      });
  }, [recipientId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecipientData({ ...recipientData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .put(`${API_BASE_URL}/api/recipients/${recipientId}/`, recipientData)
      .then(() => {
        setMessage({ text: "Recipient updated successfully!", severity: "success" });
        setOpenSnackbar(true);
        setTimeout(() => navigate("/dashboard/recipient-groups"), 1500);
      })
      .catch((error) => {
        console.error("Error updating recipient:", error);
        setMessage({ text: "Failed to update recipient", severity: "error" });
        setOpenSnackbar(true);
      });
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} 
      sx={{
        padding: 3,
        marginTop: 3,
        backgroundColor: '#f9f9f9', // Цвет фона для Paper
        borderRadius: 3,
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
      }}
      >
        <Typography variant="h5" gutterBottom>
          Edit Recipient
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="First Name"
                fullWidth
                name="first_name"
                value={recipientData.first_name}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Last Name"
                fullWidth
                name="last_name"
                value={recipientData.last_name}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                name="email"
                value={recipientData.email}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Position"
                fullWidth
                name="position"
                value={recipientData.position}
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
                  background: "linear-gradient(135deg, #06141B, #4A5C6A)",
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
                onClick={() => navigate("/dashboard/recipient-groups")}
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

export default EditRecipientForm;



