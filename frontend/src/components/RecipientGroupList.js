import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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
  Snackbar,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const RecipientGroupList = () => {
  const [recipientGroups, setRecipientGroups] = useState([]);
  const [message, setMessage] = useState({ text: "", severity: "info" });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(API_BASE_URL + '/api/recipient_groups/')
      .then(response => setRecipientGroups(response.data))
      .catch(error => console.error("Error fetching recipient groups:", error));
  }, []);

  const handleSelectGroup = (groupId) => {
    navigate(`/dashboard/recipient-groups/${groupId}`);
  };

  const handleDeleteGroup = (groupId) => {
    if (window.confirm("Are you sure you want to delete this group?")) {
      axios.delete(`${API_BASE_URL}/api/recipient_groups/${groupId}/`)
        .then(() => {
          setRecipientGroups(prevGroups => prevGroups.filter(group => group.id !== groupId));
          setMessage({ text: "Group deleted successfully!", severity: "success" });
          setOpenSnackbar(true);
        })
        .catch(error => {
          console.error("Error deleting recipient group:", error);
          setMessage({ text: "Error deleting group.", severity: "error" });
          setOpenSnackbar(true);
        });
    }
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
          Recipient Group List
        </Typography>

        <List>
          {recipientGroups.map(group => (
            <ListItem button key={group.id} onClick={() => handleSelectGroup(group.id)} divider>
              <ListItemText primary={group.name} secondary={`${group.recipients.length} recipients`} />
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={(e) => { e.stopPropagation(); handleDeleteGroup(group.id); }} color="error">
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

export default RecipientGroupList;


