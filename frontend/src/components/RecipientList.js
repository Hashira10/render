import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { API_BASE_URL } from '../config';
import {
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  TextField,
  Grid,
  Snackbar,
  Alert,
  Box
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

const RecipientList = () => {
  const { groupId } = useParams();
  const [recipients, setRecipients] = useState([]);
  const [newRecipient, setNewRecipient] = useState({ first_name: "", last_name: "", email: "", position: "" });
  const [message, setMessage] = useState({ text: "", severity: "info" });
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/recipient_groups/${groupId}/`)
      .then(response => setRecipients(response.data.recipients))
      .catch(error => console.error("Error fetching recipients:", error));
  }, [groupId]);

  const handleCreateRecipient = () => {
    if (!newRecipient.first_name || !newRecipient.last_name || !newRecipient.email || !newRecipient.position) {
      setMessage({ text: "Please fill in all fields.", severity: "warning" });
      setOpenSnackbar(true);
      return;
    }

    axios.post(`${API_BASE_URL}/api/recipients/`, newRecipient)
      .then(response => {
        const createdRecipient = response.data;
        return axios.post(`${API_BASE_URL}/api/recipient_groups/${groupId}/add_recipient/`, { recipient_id: createdRecipient.id });
      })
      .then(() => {
        setRecipients(prevRecipients => [...prevRecipients, newRecipient]);
        setMessage({ text: "Recipient added successfully!", severity: "success" });
        setNewRecipient({ first_name: "", last_name: "", email: "", position: "" });
        setOpenSnackbar(true);
      })
      .catch(error => {
        console.error("Error creating recipient:", error);
        setMessage({ text: "Error creating recipient.", severity: "error" });
        setOpenSnackbar(true);
      });
  };

  const handleDeleteRecipient = (recipientId) => {
    axios.delete(`${API_BASE_URL}/api/recipients/${recipientId}/`)
      .then(() => {
        setRecipients(recipients.filter(recipient => recipient.id !== recipientId));
        setMessage({ text: "Recipient deleted successfully!", severity: "success" });
        setOpenSnackbar(true);
      })
      .catch(error => {
        console.error("Error deleting recipient:", error);
        setMessage({ text: "Error deleting recipient.", severity: "error" });
        setOpenSnackbar(true);
      });
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={2} sx={{ padding: 2, marginTop: 3 }}>
          <Typography variant="h6">Create New Recipient</Typography>
          <Grid container spacing={1} sx={{ marginTop: 2 }}>
            <Grid item xs={6}>
              <TextField 
                label="First Name" 
                fullWidth 
                size="small"
                value={newRecipient.first_name} 
                onChange={(e) => setNewRecipient({ ...newRecipient, first_name: e.target.value })} 
                required 
              />
            </Grid>
            <Grid item xs={6}> 
              <TextField 
                label="Last Name" 
                fullWidth 
                size="small"
                value={newRecipient.last_name} 
                onChange={(e) => setNewRecipient({ ...newRecipient, last_name: e.target.value })} 
                required 
              />
            </Grid>
            <Grid item xs={6}>
              <TextField 
                label="Email" 
                type="email" 
                fullWidth 
                size="small"
                value={newRecipient.email} 
                onChange={(e) => setNewRecipient({ ...newRecipient, email: e.target.value })} 
                required 
              />
            </Grid>
            <Grid item xs={6}>
              <TextField 
                label="Position" 
                fullWidth 
                size="small"
                value={newRecipient.position} 
                onChange={(e) => setNewRecipient({ ...newRecipient, position: e.target.value })} 
                required 
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}>
                <Button 
                  variant="contained" 
                  sx={{ 
                    width: "180px", 
                    height: "36px", 
                    fontSize: "0.875rem",
                    background: "linear-gradient(135deg, #011843,rgb(127, 161, 220))", 
                    color: "#fff",
                    "&:hover": { background: "linear-gradient(135deg, #01102c,rgb(137, 174, 216))" } 
              }}
                  onClick={handleCreateRecipient}
                >
                  Create & Add
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

      <Paper elevation={3} sx={{ padding: 3, marginTop: 4, marginBottom: 4 }}>
        <Typography variant="h5" gutterBottom>
          Recipients in Group
        </Typography>
        <List>
          {recipients.map((recipient) => (
            <ListItem key={recipient.id} divider>
              <ListItemText
                primary={`${recipient.first_name} ${recipient.last_name}`}
                secondary={`${recipient.email} - ${recipient.position}`}
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" component={Link} to={`/dashboard/edit-recipient/${recipient.id}`} color="primary">
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" onClick={() => handleDeleteRecipient(recipient.id)} color="error">
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>

      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)}>
        <Alert severity={message.severity} onClose={() => setOpenSnackbar(false)}>
          {message.text}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RecipientList;





