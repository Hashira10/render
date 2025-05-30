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
      const token = localStorage.getItem("access_token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      };

      const [messageResponse, clickResponse, credentialResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/messages/`, { headers }),
        fetch(`${API_BASE_URL}/api/click_logs/`, { headers }),
        fetch(`${API_BASE_URL}/api/credential_logs/`, { headers }),
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

      const groupClickSummary = {};
      const groupCredentialSummary = {};

      messageData.forEach((message) => {
        const campaign = message.campaign_name;
        const campaignId = message.id;
        const template = message.subject;
        const group = message.recipient_group.name;

        if (!templateClicks[template]) templateClicks[template] = 0;
        if (!templateCredentials[template]) templateCredentials[template] = 0;
        if (!groupClicks[group]) groupClicks[group] = 0;
        if (!groupCredentials[group]) groupCredentials[group] = 0;

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

      // Подсчет финальных значений и заполнение сводки по группам
      Object.keys(groupedData).forEach(campaign => {
        const group = messageData.find(msg => msg.id === groupedData[campaign].id)?.recipient_group?.name;
        if (!group) return;

        groupedData[campaign].uniqueClickUsers = groupedData[campaign].uniqueClickUsers.size;
        groupedData[campaign].uniqueCredentialUsers = groupedData[campaign].uniqueCredentialUsers.size;

        if (!groupClickSummary[group]) groupClickSummary[group] = 0;
        if (!groupCredentialSummary[group]) groupCredentialSummary[group] = 0;

        groupClickSummary[group] += groupedData[campaign].uniqueClickUsers;
        groupCredentialSummary[group] += groupedData[campaign].uniqueCredentialUsers;
      });

      // Обновляем состояния
      setTopClickGroup(Object.keys(groupClickSummary).length
        ? Object.keys(groupClickSummary).reduce((a, b) => groupClickSummary[a] > groupClickSummary[b] ? a : b)
        : "Нет данных"
      );

      setTopCredentialGroup(Object.keys(groupCredentialSummary).length
        ? Object.keys(groupCredentialSummary).reduce((a, b) => groupCredentialSummary[a] > groupCredentialSummary[b] ? a : b)
        : "Нет данных"
      );

      setTopTemplate(Object.keys(platformClicks).length
        ? Object.keys(platformClicks).reduce((a, b) => platformClicks[a] > platformClicks[b] ? a : b)
        : "Нет данных"
      );

      setTopCredentialTemplate(Object.keys(platformCredentials).length
        ? Object.keys(platformCredentials).reduce((a, b) => platformCredentials[a] > platformCredentials[b] ? a : b)
        : "Нет данных"
      );

      setTopClickedSubject(Object.keys(subjectClicks).length
        ? Object.keys(subjectClicks).reduce((a, b) => subjectClicks[a] > subjectClicks[b] ? a : b)
        : "Нет данных"
      );

      setTopCredentialSubject(Object.keys(subjectCredentials).length
        ? Object.keys(subjectCredentials).reduce((a, b) => subjectCredentials[a] > subjectCredentials[b] ? a : b)
        : "Нет данных"
      );

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
    <Container maxWidth="lg" sx={{ marginBottom: 4 }}>
  <Paper
    elevation={3}
    sx={{
      padding: 3,
      marginTop: 3,
      backgroundColor: '#f9f9f9', // Цвет фона для Paper
      borderRadius: 3,
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    }}
  >
    <Typography
      variant="h5"
      align="center"
      sx={{
        marginBottom: 2,
        color: "#25344F", // Цвет текста заголовка
        fontSize: "24px", // Уменьшенный размер шрифта
      }}
    >
      Campaign Report Overview
    </Typography>

    {loading && <CircularProgress sx={{ display: "block", margin: "20px auto" }} />}
    {error && (
      <Alert severity="error" sx={{ backgroundColor: "#632024", color: "#fff", fontSize: "0.875rem" }}>
        {error}
      </Alert>
    )}

    {!loading && !error && (
      <>
        <Grid container spacing={2} sx={{ marginBottom: 2, justifyContent: "center" }}>
          {[
            { label: "Most Clicked Platform", value: topTemplate },
            { label: "Most Clicked Group", value: topClickGroup },
            { label: "Most Clicked Email Subject", value: topClickedSubject },
            { label: "Most Credential Submissions Platform", value: topCredentialTemplate },
            { label: "Most Credential Submission Group", value: topCredentialGroup },
            { label: "Most Credential Submission Email Subject", value: topCredentialSubject }
          ].map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  background: "#f0f4f8", // Цвет фона карточки
                  color: "#333",
                  borderRadius: "12px",
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                  transition: "transform 0.2s ease-in-out",
                  "&:hover": {
                    transform: "scale(1.03)",
                    backgroundColor: "#d1dde7", // Цвет фона при наведении
                  },
                }}
              >
                <CardContent>
                  <Typography variant="subtitle2" sx={{ opacity: 0.7, color: "#555", fontSize: "0.875rem" }}>
                    {item.label}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", color: "#25344F", marginTop: 1, fontSize: "1rem" }}
                  >
                    {item.value || "N/A"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Typography variant="h6" align="center" sx={{ marginBottom: 2, color: "#25344F", fontSize: "1rem" }}>
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
                    background: "#4A5C6A", // Цвет кнопки
                    color: "#fff",
                    "&:hover": {
                      background: "linear-gradient(135deg, #253745, #9fb7d3)", // Градиент при наведении
                    },
                    fontSize: "0.875rem", // Уменьшение размера шрифта
                  }}
                >
                  {campaign}
                </Button>
              </Grid>
            ))}
        </Grid>


      </>
    )}
  </Paper>
</Container>


  );
  
};
export default Report;






