import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { API_BASE_URL } from '../config';
import {
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

const SenderList = () => {
  const [senders, setSenders] = useState([]);
  const [message, setMessage] = useState({ text: "", severity: "info" });
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/senders/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      })
      .then((response) => setSenders(response.data))
      .catch((error) => {
        console.error("Error fetching senders:", error);
        setMessage({ text: "Failed to load senders.", severity: "error" });
        setOpenSnackbar(true);
      });
  }, []);
  
  const handleDeleteSender = (senderId) => {
    axios
      .delete(`${API_BASE_URL}/api/senders/${senderId}/`)
      .then(() => {
        setSenders(senders.filter((sender) => sender.id !== senderId));
        setMessage({ text: "Sender deleted successfully!", severity: "success" });
        setOpenSnackbar(true);
      })
      .catch((error) => {
        console.error("Error deleting sender:", error);
        setMessage({ text: "Failed to delete sender.", severity: "error" });
        setOpenSnackbar(true);
      });
  };

  return (
    <Container maxWidth="md">
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
          Sender List
        </Typography>

        <List>
          {senders.map((sender) => (
            <ListItem key={sender.id} divider>
              <ListItemText
                primary={sender.smtp_username}
                secondary={sender.smtp_host}
              />
              <IconButton
                onClick={() => handleDeleteSender(sender.id)}
                color="error"
                sx={{ marginRight: 2 }}
              >
                <DeleteIcon />
              </IconButton>
              <Link to={`/dashboard/edit-sender/${sender.id}`}>
                <Button variant="outlined" color="primary" size="small">
                  <EditIcon /> Edit
                </Button>
              </Link>
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

export default SenderList;
