import React, { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { API_BASE_URL } from "../config";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import UploadFileIcon from "@mui/icons-material/UploadFile";

const AddRecipientGroupForm = () => {
  const [groupName, setGroupName] = useState("");
  const [recipients, setRecipients] = useState([
    { firstName: "", lastName: "", email: "", position: "" },
  ]);
  const [message, setMessage] = useState({ text: "", severity: "info" });
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const validHeaders = ["firstName", "lastName", "email", "position"];

  const validateHeaders = (headers) => {
    return validHeaders.every((header) => headers.includes(header));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ({ target }) => {
      const fileData = target.result;
      if (file.name.endsWith(".csv")) {
        Papa.parse(fileData, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const headers = Object.keys(results.data[0] || {});
            if (!validateHeaders(headers)) {
              alert(
                `Ошибка! Неверный формат файла.\n\nОжидаемый формат (CSV, XLSX):\nfirstName,lastName,email,position\n\nПример строки:\nJohn,Doe,john.doe@example.com,Manager`
              );
              return;
            }
            setRecipients(results.data);
          },
        });
      } else {
        const workbook = XLSX.read(fileData, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        const headers = Object.keys(sheet[0] || {});
        if (!validateHeaders(headers)) {
          alert(
            `Ошибка! Неверный формат файла.\n\nОжидаемый формат (CSV, XLSX):\nfirstName,lastName,email,position\n\nПример строки:\nJohn,Doe,john.doe@example.com,Manager`
          );
          return;
        }
        setRecipients(sheet);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const filteredRecipients = recipients
      .filter(r => r.firstName && r.lastName && r.email && r.position)
      .map(r => ({
        first_name: r.firstName.trim(),
        last_name: r.lastName.trim(),
        email: r.email.trim(),
        position: r.position.trim(),
      }));
  
    
    if (!groupName.trim()) {
      setMessage({ text: "Введите название группы", severity: "error" });
      setOpenSnackbar(true);
      return;
    }
    if (filteredRecipients.length === 0) {
      setMessage({ text: "Добавьте хотя бы одного получателя", severity: "error" });
      setOpenSnackbar(true);
      return;
    }
  
    const groupData = {
      name: groupName.trim(), 
      recipients: filteredRecipients,
    };
  
    try {
      const response = await axios.post(`${API_BASE_URL}/api/recipient_groups/`, groupData, {
        headers: { "Content-Type": "application/json" },
      });
  
      if (response.status === 201 || response.status === 200) {
        setMessage({ text: "Группа получателей успешно добавлена!", severity: "success" });
        setGroupName("");
        setRecipients([{ firstName: "", lastName: "", email: "", position: "" }]);
      } else {
        throw new Error("Ошибка при отправке данных");
      }
    } catch (error) {
      console.error("Ошибка запроса:", error.response?.data || error.message);
      setMessage({ text: `Ошибка: ${error.response?.data?.message || "Не удалось добавить группу"}`, severity: "error" });
    }
  
    setOpenSnackbar(true);
  };

  return (
    <Container maxWidth="sm" sx={{ marginBottom: 6 }}>
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
          Add Recipient Group
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Название группы"
            fullWidth
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
            sx={{ marginBottom: 2 }}
          />

          <Button
            variant="outlined"
            component="label"
            startIcon={<UploadFileIcon />}
            sx={{
              width: "100%",
              height: "40px",
              borderColor: "#011843",
              color: "#011843",
              "&:hover": { background: "#011843", color: "#fff" },
              marginBottom: 2,
            }}
          >
            Upload Recipient List
            <input type="file" hidden accept=".csv, .xlsx, .xls" onChange={handleFileUpload} />
          </Button>

          <Typography variant="h6">Recipients</Typography>

          {recipients.map((recipient, index) => (
            <Paper key={index} elevation={2} sx={{ padding: 2, marginBottom: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="First Name"
                    fullWidth
                    value={recipient.firstName}
                    onChange={(e) => {
                      const newRecipients = [...recipients];
                      newRecipients[index].firstName = e.target.value;
                      setRecipients(newRecipients);
                    }}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Last Name"
                    fullWidth
                    value={recipient.lastName}
                    onChange={(e) => {
                      const newRecipients = [...recipients];
                      newRecipients[index].lastName = e.target.value;
                      setRecipients(newRecipients);
                    }}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Email"
                    type="email"
                    fullWidth
                    value={recipient.email}
                    onChange={(e) => {
                      const newRecipients = [...recipients];
                      newRecipients[index].email = e.target.value;
                      setRecipients(newRecipients);
                    }}
                    required
                  />
                </Grid>
                <Grid item xs={10}>
                  <TextField
                    label="Position"
                    fullWidth
                    value={recipient.position}
                    onChange={(e) => {
                      const newRecipients = [...recipients];
                      newRecipients[index].position = e.target.value;
                      setRecipients(newRecipients);
                    }}
                    required
                  />
                </Grid>
                <Grid item xs={2} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <IconButton
                    onClick={() => {
                      const newRecipients = recipients.filter((_, i) => i !== index);
                      setRecipients(newRecipients);
                    }}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </Paper>
          ))}

          <Grid container spacing={2} sx={{ marginTop: 2 }}>
            <Grid item xs={6}>
              <Button
                variant="outlined"
                startIcon={<AddCircleIcon />}
                onClick={() =>
                  setRecipients([...recipients, { firstName: "", lastName: "", email: "", position: "" }])
                }
                sx={{
                  width: "100%",
                  height: "40px",
                  borderColor: "#011843",
                  color: "#011843",
                  "&:hover": { background: "#011843", color: "#fff" },
                }}
              >
                Add recipient
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button type="submit" variant="contained"
              sx={{ 
                width: "100%",
                height: "40px",
                background: "linear-gradient(135deg, #06141B, #4A5C6A)",
                color: "#fff",
                "&:hover": { background: "linear-gradient(135deg, #01102c, #9fb7d3)" }
              }}
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default AddRecipientGroupForm;

