import React, { useState, useEffect } from "react";
import { Container, Paper, Typography, TextField, Select, MenuItem, FormControl, InputLabel, Checkbox, FormControlLabel, Button, Grid, Snackbar, Alert, Box, CircularProgress } from "@mui/material";
import { API_BASE_URL } from '../config';

const Campaigns = () => {
  const [senders, setSenders] = useState([]);
  const [recipientGroups, setRecipientGroups] = useState([]);
  const [campaignName, setCampaignName] = useState("");
  const [selectedSender, setSelectedSender] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [subject, setSubject] = useState("");
  const [selectedModel, setSelectedModel] = useState("openai");
  const [body, setBody] = useState("");
  const [useTemplate, setUseTemplate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState({ text: "", severity: "info" });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [platform, setPlatform] = useState("facebook");
  const [generating, setGenerating] = useState(false);
  const [customHost, setCustomHost] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);


  const getPlatformLinks = (host) => ({
    facebook: `${host}/track/{recipient_id}/{message_id}/facebook/`,
    instagram: `${host}/track/{recipient_id}/{message_id}/instagram/`,
    google: `${host}/track/{recipient_id}/{message_id}/google/`,
    microsoft: `${host}/track/{recipient_id}/{message_id}/microsoft/`
  });

  const generateLinks = (message, platform, recipientId, messageId) => {
    const links = getPlatformLinks(customHost || API_BASE_URL);
    const templateLink = links[platform]
      ? links[platform].replace("{recipient_id}", recipientId).replace("{message_id}", messageId)
      : "#";

    console.log(templateLink)
    return templateLink
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sendersRes, groupsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/senders/`),
          fetch(`${API_BASE_URL}/api/recipient_groups/`)
        ]);

        const sendersData = await sendersRes.json();
        const groupsData = await groupsRes.json();

        setSenders(sendersData);
        setRecipientGroups(groupsData);
      } catch (error) {
        setMessage({ text: "Error fetching data!", severity: "error" });
        setOpenSnackbar(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleGenerateMessage = async () => {
    if (!subject.trim()) {
      setMessage({ text: "Subject is required to generate an email!", severity: "warning" });
      setOpenSnackbar(true);
      return;
    }

    setLoading(true);
    try {
        const previewResponse = await fetch(`${API_BASE_URL}/api/messages/preview/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sender: selectedSender,
              recipient_group: selectedGroup,
              campaign_name: campaignName,
              subject,
              body,
              platform,
              host: customHost || API_BASE_URL
            }),
      });
      const previewData = await previewResponse.json();
      if (!previewResponse.ok) {
        throw new Error(previewData.detail || "Error getting message preview");
      }

      const response = await fetch(`${API_BASE_URL}/generate/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject,
            employee_name: selectedSender,
            model: selectedModel || "openai"
          }),
      });


      const data = await response.json();

      if (response.ok) {
        const cleanedBody = data.email
          .replace(/^(?:\*\*Subject:\*\* .*|Subject: .*)\n?/gm, '') // Remove any Subject lines
          .replace(/^\s*```(?:html)?\s*/gm, '') // Remove opening ``` or ```html with optional spaces
          .replace(/\s*```$/gm, '') // Remove closing ``` with optional spaces
          .trim();
        setBody(cleanedBody);
        setMessage({ text: "Email generated successfully!", severity: "success" });

        console.log(cleanedBody)
      } else {
        setMessage({ text: data.error || "Failed to generate email.", severity: "error" });
      }
    } catch (error) {
      setMessage({ text: "Error generating email!", severity: "error" });
    } finally {
      setLoading(false);
      setOpenSnackbar(true);
    }
  };

  const emails = body.split(/-----|\--/);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;
      return nextIndex < emails.length ? nextIndex : 0; // Переход к следующему письму
    });
  };
  
  const handlePrev = () => {
    setCurrentIndex((prevIndex) => {
      const prevIndexAdjusted = prevIndex - 1;
      return prevIndexAdjusted >= 0 ? prevIndexAdjusted : emails.length - 1; // Переход к предыдущему письму
    });
  };
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
  
    if (!campaignName || !selectedSender || !selectedGroup || !subject || !body) {
      setMessage({ text: "All fields are required!", severity: "warning" });
      setOpenSnackbar(true);
      return;
    }

    const selectedEmail = emails[currentIndex];
  
    setSending(true);
  
    try {

      const finalResponse = await fetch(`${API_BASE_URL}/api/messages/send_message/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: selectedSender,
          recipient_group: selectedGroup,
          campaign_name: campaignName,
          subject,
          body: selectedEmail,
          platform,
          host: customHost || API_BASE_URL,
        }),
      });
  
      const finalData = await finalResponse.json();
      if (!finalResponse.ok) {
        throw new Error(finalData.detail || "Error sending message");
      }
  
      setMessage({ text: "Message sent successfully!", severity: "success" });
      setCampaignName("");
      setSubject("");
      setBody("");
      setUseTemplate(false);
    } catch (error) {
      setMessage({ text: `Error: ${error.message}`, severity: "error" });
    } finally {
      setSending(false);
      setOpenSnackbar(true);
    }
  };


  return (
    <Container maxWidth="md" sx={{ marginBottom: 8 }}>
      <Paper elevation={3} sx={{ padding: 3, marginTop: 4 }}>
        <Typography variant="h5" gutterBottom>
          Send Message
        </Typography>

        <Grid item xs={12} sx={{ marginBottom: 2 }}>
          <TextField label="Campaign Name" fullWidth value={campaignName} onChange={(e) => setCampaignName(e.target.value)} required />
        </Grid>

        <form onSubmit={handleSendMessage}>
          <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Sender</InputLabel>
                  <Select value={selectedSender} onChange={(e) => setSelectedSender(e.target.value)} disabled={loading || sending}>
                    <MenuItem value="">Select Sender</MenuItem>
                    {senders.map((sender) => (
                      <MenuItem key={sender.id} value={sender.id}>
                        {sender.smtp_username}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Recipient Group</InputLabel>
                  <Select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)} disabled={loading || sending}>
                    <MenuItem value="">Select Recipient Group</MenuItem>
                    {recipientGroups.map((group) => (
                      <MenuItem key={group.id} value={group.id}>
                        {group.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                    <InputLabel>Platform</InputLabel>
                    <Select value={platform} onChange={(e) => setPlatform(e.target.value)} disabled={sending}>
                        <MenuItem value="facebook">Facebook</MenuItem>
                        <MenuItem value="instagram">Instagram</MenuItem>
                        <MenuItem value="google">Google</MenuItem>
                        <MenuItem value="microsoft">Microsoft</MenuItem>
                    </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Custom Host (optional)"
                  fullWidth
                  value={customHost}
                  onChange={(e) => setCustomHost(e.target.value)}
                  disabled={sending}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField label="Subject" fullWidth value={subject} onChange={(e) => setSubject(e.target.value)} required />
              </Grid>

              <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="model-select-label">AI Model</InputLabel>
                    <Select
                      labelId="model-select-label"
                      id="model-select"
                      value={selectedModel}
                      label="AI Model"
                      onChange={(e) => setSelectedModel(e.target.value)}
                    >
                      <MenuItem value="openai">OpenAI GPT-4o</MenuItem>
                      <MenuItem value="gemini">Gemini 2.0 Flash</MenuItem>
                    </Select>
                  </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  onClick={handleGenerateMessage}
                  disabled={loading}
                  sx={{ 
                    width: "180px",
                    height: "36px", 
                    fontSize: "0.875rem",
                    background: sending ? "gray" : "linear-gradient(135deg, #011843,rgb(127, 161, 220))", 
                    color: "#fff", 
                    "&:hover": { background: sending ? "gray" : "linear-gradient(135deg, #01102c,rgb(137, 174, 216))" }
                  }}
                >
                  {loading ? <CircularProgress size={20} sx={{ color: "white", marginRight: 1 }} /> : "Generate Email"}
                </Button>
              </Grid>

              <Grid item xs={12}>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <Button 
                        variant="contained" 
                        onClick={handlePrev} 
                        disabled={currentIndex === 0}
                        sx={{ 
                          backgroundColor: "#1E56A0", // Темно-синий цвет
                          color: "#fff", 
                          "&:hover": { backgroundColor: "#01102c" } // Чуть темнее при наведении
                        }}
                      >
                        Prev &lt;
                      </Button>
                      <TextField
                          fullWidth
                          multiline
                          rows={10}
                          value={emails[currentIndex]}
                          InputProps={{ readOnly: true }}
                      />
                      <Button 
                        variant="contained" 
                        onClick={handleNext} 
                        disabled={currentIndex === emails.length - 1}
                        sx={{ 
                          backgroundColor: "#1E56A0", // Темно-синий цвет
                          color: "#fff", 
                          "&:hover": { backgroundColor: "#01102c" } // Чуть темнее при наведении
                        }}
                        >
                          Next &gt;
                      </Button>
                  </div>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={sending}
                    sx={{
                      width: "180px",
                      height: "36px",
                      fontSize: "0.875rem",
                      background: sending ? "gray" : "linear-gradient(135deg, #011843,rgb(127, 161, 220))",
                      color: "#fff",
                      "&:hover": { background: sending ? "gray" : "linear-gradient(135deg, #01102c,rgb(137, 174, 216))" }
                    }}
                  >
                    {sending ? (
                      <>
                        <CircularProgress size={20} sx={{ color: "white", marginRight: 1 }} /> Sending...
                      </>
                    ) : (
                      "Send Message"
                    )}
                  </Button>
                </Box>
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

export default Campaigns;