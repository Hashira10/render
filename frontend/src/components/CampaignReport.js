import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container, Paper, Typography, Button, Grid, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow
} from "@mui/material";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell
} from "recharts";

const CampaignReport = ({ groupedLogs }) => {
  const { campaignName } = useParams();
  const navigate = useNavigate();

  const campaignData = groupedLogs[campaignName];

  if (!campaignData) {
    return (
      <Container maxWidth="md">
        <Typography variant="h5" align="center" sx={{ marginTop: 4, color: "red" }}>
          Campaign "{campaignName}" not found
        </Typography>
        <Button onClick={() => navigate("/report")} variant="contained" sx={{ marginTop: 2 }}>
          Back to Report
        </Button>
      </Container>
    );
  }


  return (
    <Container maxWidth="lg" sx={{ marginBottom: 8 }}>
      <Paper elevation={3} sx={{ padding: 4, marginTop: 4 }}>
        <Button onClick={() => navigate("/dashboard/report")} variant="outlined" sx={{ marginBottom: 2 }}>
          ⬅ Back to Report
        </Button>

        <Typography variant="h4" align="center" sx={{ fontWeight: "bold", marginBottom: 3 }}>
          Report for Campaign: {campaignData.name}
        </Typography>

        <Grid container spacing={3} sx={{ marginTop: 2 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" align="center">User Interactions</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: "Clicked", value: campaignData.uniqueClickUsers },
                { name: "Not Clicked", value: campaignData.totalRecipients - campaignData.uniqueClickUsers },
                { name: "Submitted", value: campaignData.uniqueCredentialUsers },
                { name: "Not Submitted", value: campaignData.totalRecipients - campaignData.uniqueCredentialUsers }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />

                <defs>
                  <linearGradient id="barClicked" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#01102c" />
                    <stop offset="100%" stopColor="#9fb7d3" />
                  </linearGradient>
                  <linearGradient id="barSubmitted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0e3a5e" />
                    <stop offset="100%" stopColor="#50d6db" />
                  </linearGradient>
                  <linearGradient id="barGray" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#b0b0b0" />
                    <stop offset="100%" stopColor="#808080" />
                  </linearGradient>
                </defs>

                <Bar dataKey="value">
                  <Cell fill="url(#barClicked)" />
                  <Cell fill="url(#barGray)" />
                  <Cell fill="url(#barSubmitted)" />
                  <Cell fill="url(#barGray)" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" align="center">Click vs Submission Distribution</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <defs>
                  <linearGradient id="clickedGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#01102c" />
                    <stop offset="100%" stopColor="#9fb7d3" />
                  </linearGradient>
                  <linearGradient id="submittedGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#0e3a5e" />
                    <stop offset="100%" stopColor="#50d6db" />
                  </linearGradient>
                  <linearGradient id="noActivityGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#d3d3d3" />
                    <stop offset="100%" stopColor="#a9a9a9" />
                  </linearGradient>
                </defs>

                <Pie data={[
                  { name: "Clicked", value: campaignData?.uniqueClickUsers || 0 },
                  { name: "Submitted", value: campaignData?.uniqueCredentialUsers || 0 },
                  ...(campaignData?.uniqueClickUsers === 0 && campaignData?.uniqueCredentialUsers === 0 
                    ? [{ name: "No Activity", value: 1 }]
                    : [])
                ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label>
                  <Cell fill="url(#clickedGradient)" />
                  <Cell fill="url(#submittedGradient)" />
                  <Cell fill="url(#noActivityGradient)" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Grid>
        </Grid>

        <Typography variant="h6" sx={{ marginTop: 4 }}>
          Summary Table
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Campaign Name</strong></TableCell>
                <TableCell><strong>Total Recipients</strong></TableCell>
                <TableCell><strong>Clicked (%)</strong></TableCell>
                <TableCell><strong>Submitted (%)</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>{campaignData.name}</TableCell>
                <TableCell>{campaignData.totalRecipients}</TableCell>
                <TableCell>{((campaignData.uniqueClickUsers / campaignData.totalRecipients) * 100).toFixed(2)}%</TableCell>
                <TableCell>{((campaignData.uniqueCredentialUsers / campaignData.totalRecipients) * 100).toFixed(2)}%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default CampaignReport;

