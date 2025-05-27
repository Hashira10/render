import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import axios from "axios";

import Auth from "./components/Auth";
import MainLayout from "./components/MainLayout";
import AddSenderForm from "./components/AddSenderForm";
import AddRecipientGroupForm from "./components/AddRecipientGroupForm";
import SenderList from "./components/SenderList";
import EditSenderForm from "./components/EditSenderForm";
import RecipientGroupList from "./components/RecipientGroupList";
import RecipientList from "./components/RecipientList";
import EditRecipientForm from "./components/EditRecipientForm";
import Campaigns from "./components/Campaigns";
import Report from "./components/Report";
import CampaignReport from "./components/CampaignReport";
import Profile from "./components/Profile";
import { API_BASE_URL } from "./config";
import "./App.css";

const PrivateRoute = ({ element, isAuthenticated }) => {
    return isAuthenticated ? element : <Navigate to="/auth" />;
};

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const [groupedLogs, setGroupedLogs] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get(`${API_BASE_URL}/check-auth/`, { withCredentials: true })
            .then((response) => {
                if (response.status === 200) {
                    setIsAuthenticated(true);
                }
            })
            .catch(() => {
                setIsAuthenticated(false);
            });
    }, []);

    useEffect(() => {
      const fetchData = async () => {
        try {
          const token = localStorage.getItem("access_token");
          if (!token) throw new Error("No access token found");

          // Запросы с axios и заголовком Authorization
          const [messageResponse, clickResponse, credentialResponse] = await Promise.all([
            axios.get(`${API_BASE_URL}/api/messages/`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${API_BASE_URL}/api/click_logs/`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${API_BASE_URL}/api/credential_logs/`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

          const messageData = messageResponse.data;
          const clickData = clickResponse.data;
          const credentialData = credentialResponse.data;

          const groupedData = {};

          messageData.forEach((message) => {
            const campaign = message.campaign_name;
            if (!groupedData[campaign]) {
              groupedData[campaign] = {
                name: campaign,
                totalRecipients: 0,
                uniqueClickUsers: new Set(),
                uniqueCredentialUsers: new Set(),
              };
            }
            const recipients = message.recipients || [];
            groupedData[campaign].totalRecipients += recipients.length;
          });

          clickData.forEach((log) => {
            const message = messageData.find((msg) => msg.id === log.message);
            if (message) {
              const campaign = message.campaign_name;
              groupedData[campaign]?.uniqueClickUsers.add(log.recipient?.id);
            }
          });

          credentialData.forEach((log) => {
            const message = messageData.find((msg) => msg.id === log.message);
            if (message) {
              const campaign = message.campaign_name;
              groupedData[campaign]?.uniqueCredentialUsers.add(log.recipient?.id);
            }
          });

          Object.keys(groupedData).forEach((campaign) => {
            groupedData[campaign].uniqueClickUsers = groupedData[campaign].uniqueClickUsers.size;
            groupedData[campaign].uniqueCredentialUsers = groupedData[campaign].uniqueCredentialUsers.size;
          });

          setGroupedLogs(groupedData);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, []);

      

    return (
        <Router>
            <Routes>
                <Route path="/auth" element={<Auth setIsAuthenticated={setIsAuthenticated} />} />
                <Route path="/dashboard/*" element={<PrivateRoute isAuthenticated={isAuthenticated} element={<MainLayout setIsAuthenticated={setIsAuthenticated} />} />} />

                {/* 🔹 Перенаправление на /dashboard, если пользователь вошел */}
                <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/auth"} />} />

                {/* 🔹 Вложенные маршруты для страниц в Dashboard */}
                <Route path="/dashboard" element={<MainLayout setIsAuthenticated={setIsAuthenticated} />}>
                    <Route index element={<AddSenderForm />} />
                    <Route path="senders" element={<SenderList />} />
                    <Route path="edit-sender/:senderId" element={<EditSenderForm />} />
                    <Route path="add-recipient-group" element={<AddRecipientGroupForm />} />
                    <Route path="recipient-groups" element={<RecipientGroupList />} />
                    <Route path="recipient-groups/:groupId" element={<RecipientList />} />
                    <Route path="edit-recipient/:recipientId" element={<EditRecipientForm />} />
                    <Route path="send-message" element={<Campaigns />} />
                    <Route
                      path="report"
                      element={
                        <Report
                          groupedLogs={groupedLogs}
                          loading={loading}
                          error={error}
                        />
                      }
                    />

                    <Route path="/dashboard/campaign/:campaignName" element={<CampaignReport groupedLogs={groupedLogs} />} />
                    <Route path="/dashboard/profile" element={<Profile />} />

                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
