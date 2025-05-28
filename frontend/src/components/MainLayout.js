import React, { useEffect } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from '../config';

const MainLayout = ({ setIsAuthenticated }) => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        console.log("Current Path:", location.pathname);
    }, [location]);

    const handleLogout = async () => {
        try {
            await axios.post("${API_BASE_URL}/logout/", {}, { withCredentials: true });
            setIsAuthenticated(false);
            navigate("/auth");
        } catch (error) {
            console.error("Logout failed. Try again.");
        }
    };

    const getPageTitle = () => {
        switch (location.pathname) {
        case "/dashboard":
            return "Add Sender";
        case "/dashboard/senders":
            return "Sender List";
        case "/dashboard/edit-sender/:senderId":
            return "Edit Sender";
        case "/dashboard/add-recipient-group":
            return "Add Recipient Group";
        case "/dashboard/recipient-groups":
            return "Recipient Group List";
        case "/dashboard/send-message":
            return "Campaigns";
        case "/dashboard/report":
            return "Report";
        case "/dashboard/profile":
        return "Profile";
        default:
            return "Email System";
        }
    };

    return (
        <div>
            <h1>{getPageTitle()}</h1>

            <nav>
                <ul>
                    <li><Link to="/dashboard">Add Sender</Link></li>
                    <li><Link to="/dashboard/senders">Sender List</Link></li>
                    <li><Link to="/dashboard/add-recipient-group">Add Recipient Group</Link></li>
                    <li><Link to="/dashboard/recipient-groups">Recipient Group List</Link></li>
                    <li><Link to="/dashboard/send-message">Campaigns</Link></li>
                    <li><Link to="/dashboard/report">Report</Link></li>
                    <li><Link to="/dashboard/profile">Profile</Link></li>
                    <li><Link to="/auth" onClick={handleLogout}>Logout</Link></li>
                </ul>
            </nav>

            <Outlet />
        </div>
    );
};

export default MainLayout;

