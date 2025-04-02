import React, { useEffect, useState } from "react";
import {
  CircularProgress,
  Container,
  Paper,
  Typography,
  Alert,
  Button,
  Grid,
  Card,
  CardContent,
} from "@mui/material";

import { API_BASE_URL } from '../config';
import { useNavigate } from "react-router-dom";

const Report = () => {
  const [messages, setMessages] = useState([]);
  const [clickLogs, setClickLogs] = useState([]);
  const [credentialLogs, setCredentialLogs] = useState([]);
  const [groupedLogs, setGroupedLogs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topTemplate, setTopTemplate] = useState("Нет данных");
  const [topCredentialTemplate, setTopCredentialTemplate] = useState("Нет данных");
  const [topClickGroup, setTopClickGroup] = useState("Нет данных");
  const [topCredentialGroup, setTopCredentialGroup] = useState("Нет данных");
  const [topClickedSubject, setTopClickedSubject] = useState("Нет данных");
  const [topCredentialSubject, setTopCredentialSubject] = useState("No Data");


  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [messageResponse, clickResponse, credentialResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/messages/`),  
          fetch(`${API_BASE_URL}/api/click_logs/`),
          fetch(`${API_BASE_URL}/api/credential_logs/`)
        ]);
  
        if (!messageResponse.ok || !clickResponse.ok || !credentialResponse.ok) {
          throw new Error("Failed to fetch data");
        }
  
        const [messageData, clickData, credentialData] = await Promise.all([
          messageResponse.json(),
          clickResponse.json(),
          credentialResponse.json()
        ]);
  
        setMessages(messageData);
        setClickLogs(clickData);
        setCredentialLogs(credentialData);

        const templateClicks = {};
        const templateCredentials = {};
        const groupClicks = {};
        const groupCredentials = {};
        const groupedData = {};
        const platformClicks = {};
        const platformCredentials = {};
        const subjectClicks = {};
        const subjectCredentials = {};

        messageData.forEach((message) => {
          const campaign = message.campaign_name;
          const campaignId = message.id;
          const template = message.subject;
          const group = message.recipient_group.name;


          if (!templateClicks[template]) templateClicks[template] = 0;
          if (!templateCredentials[template]) templateCredentials[template] = 0;
          if (!groupClicks[group]) groupClicks[group] = 0;
          if (!groupCredentials[group]) groupCredentials[group] = 0;
          

          clickData.forEach(log => {
            const platform = log.platform || "unknown";
            platformClicks[platform] = (platformClicks[platform] || 0) + 1;

            const message = messageData.find(msg => msg.id === log.message);
            if (message) {
              subjectClicks[message.subject] = (subjectClicks[message.subject] || 0) + 1;
            }

          });

          credentialData.forEach(log => {
            const platform = log.platform || "unknown";
            platformCredentials[platform] = (platformCredentials[platform] || 0) + 1;

            const message = messageData.find(msg => msg.id === log.message);
            if (message) {
              subjectCredentials[message.subject] = (subjectCredentials[message.subject] || 0) + 1;
            }

          });
          
          if (!groupedData[campaign]) {
            groupedData[campaign] = {
              id: campaignId,
              name: campaign,
              totalRecipients: 0,
              uniqueClickUsers: new Set(),
              uniqueCredentialUsers: new Set()
            };
          }
          const recipients = message.recipients || [];
  
          groupedData[campaign].totalRecipients += recipients.length;
  
          recipients.forEach((recipient) => {
            clickData.forEach(log => {
              if (log.recipient?.id === recipient.id && log.message === message.id) {  
                groupedData[campaign].uniqueClickUsers.add(recipient.id);
              }
            });
  
            credentialData.forEach(log => {
              if (log.recipient?.id === recipient.id && log.message === message.id) {  
                groupedData[campaign].uniqueCredentialUsers.add(recipient.id);
              }
            });
          });
        });
  
        Object.keys(groupedData).forEach(campaign => {
          groupedData[campaign].uniqueClickUsers = groupedData[campaign].uniqueClickUsers.size;
          groupedData[campaign].uniqueCredentialUsers = groupedData[campaign].uniqueCredentialUsers.size;
        });
  

        setTopTemplate(Object.keys(platformClicks).reduce((a, b) => platformClicks[a] > platformClicks[b] ? a : b, "Нет данных"));
        setTopCredentialTemplate(Object.keys(platformCredentials).reduce((a, b) => platformCredentials[a] > platformCredentials[b] ? a : b, "Нет данных"));
        setTopClickGroup(Object.keys(groupClicks).reduce((a, b) => groupClicks[a] > groupClicks[b] ? a : b, "Нет данных"));
        setTopCredentialGroup(Object.keys(groupCredentials).reduce((a, b) => groupCredentials[a] > groupCredentials[b] ? a : b, "Нет данных"));
        setTopClickedSubject(Object.keys(subjectClicks).reduce((a, b) => subjectClicks[a] > subjectClicks[b] ? a : b, "Нет данных"));
        setTopCredentialSubject(Object.keys(subjectCredentials).reduce((a, b) => subjectCredentials[a] > subjectCredentials[b] ? a : b, "No Data"));

        setGroupedLogs(groupedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);
  
  

  const COLORS = ["#7b8bff", "#242c6c"];

  return (
    <Container maxWidth="lg" sx={{ marginBottom: 8 }}>
      <Paper elevation={3} sx={{ padding: 4, marginTop: 4 }}>
        <Typography variant="h4" align="center" sx={{ fontWeight: "bold", marginBottom: 3 }}>
          Campaign Report Overview
        </Typography>
  
        {loading && <CircularProgress sx={{ display: "block", margin: "20px auto" }} />}
        {error && <Alert severity="error">{error}</Alert>}
  
        {!loading && !error && (
          <>
            <Grid container spacing={3} sx={{ marginBottom: 3, justifyContent: "center" }}>
              {[
                { label: "Most Clicked Platform", value: topTemplate },
                { label: "Most Clicked Group", value: topClickGroup },
                { label: "Most Clicked Email Subject", value: topClickedSubject },
                { label: "Most Credential Submissions Platform", value: topCredentialTemplate },
                { label: "Most Credential Submission Group", value: topCredentialGroup },               
                { label: "Most Credential Submission Email Subject", value: topCredentialSubject }
              ].map((item, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card sx={{
                    background: "#f0f4f8", 
                    color: "#333", 
                    borderRadius: "12px",
                    boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
                    transition: "transform 0.2s ease-in-out",
                    "&:hover": { transform: "scale(1.03)" }
                  }}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ opacity: 0.7, color: "#555" }}>
                        {item.label}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: "bold", color: "#354d78", marginTop: 1 }}>
                        {item.value || "N/A"}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
  
            <Typography variant="h6" align="center" sx={{ marginBottom: 2 }}>
              Select a Campaign:
            </Typography>
            <Grid container spacing={2} justifyContent="center">
              {Object.entries(groupedLogs)
                .sort(([, a], [, b]) => {
                  const idA = a?.id ?? 0; // Защита от undefined
                  const idB = b?.id ?? 0;
                  return idB - idA; // От новых к старым
                })
                .map(([campaign]) => (
                  <Grid item key={campaign}>
                    <Button
                      variant="contained"
                      onClick={() => navigate(`/dashboard/campaign/${campaign}`)}
                      sx={{
                        background: "#354d78",
                        color: "#fff",
                        "&:hover": { background: "linear-gradient(135deg, #01102c, #9fb7d3)" }
                      }}
                    >
                      {campaign}
                    </Button>
                  </Grid>
                ))}
            </Grid>
          </>
        )}
      </Paper> {/* ✅ Закрывающий тег Paper */}
    </Container>
  );
  
};
export default Report;






