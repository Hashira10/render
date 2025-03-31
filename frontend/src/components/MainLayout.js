import React, { useEffect } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import axios from "axios";


const MainLayout = ({ setIsAuthenticated }) => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        console.log("Current Path:", location.pathname);
    }, [location]);

    const handleLogout = async () => {
        try {
            await axios.post("http://127.0.0.1:8000/logout/", {}, { withCredentials: true });
            setIsAuthenticated(false);
            navigate("/auth");
        } catch (error) {
            console.error("Logout failed. Try again.");
        }
    };

    return (
        <div>
            <h1>Email System</h1>

            <nav>
                <ul>
                    <li><Link to="/dashboard">Add Sender</Link></li>
                    <li><Link to="/dashboard/senders">Sender List</Link></li>
                    <li><Link to="/dashboard/add-recipient-group">Add Recipient Group</Link></li>
                    <li><Link to="/dashboard/recipient-groups">Recipient Group List</Link></li>
                    <li><Link to="/dashboard/send-message">Campaigns</Link></li>
                    <li><Link to="/dashboard/report">Report</Link></li>
                    <button onClick={handleLogout}>Logout</button>
                </ul>
            </nav>

            <Outlet />
        </div>
    );
};

export default MainLayout;

