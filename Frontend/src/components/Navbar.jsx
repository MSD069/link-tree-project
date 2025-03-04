import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios"; // Add axios for fetching username
import "./Navbar.css";
import { useSettings } from "../context/SettingsContext"; // Import useSettings if needed
import sparkimg from "../assets/Vector (3).png";

const Navbar = () => {
  const navigate = useNavigate();
  const { username } = useSettings(); // Use username from SettingsContext (optional)
  const [userName, setUserName] = useState("Jenny Wilson"); // Default value
  const VITE_BACK_URL = import.meta.env.VITE_BACK_URL;

  // Fetch username from backend when component mounts
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const fetchUsername = async () => {
        try {
          const response = await axios.get(`${VITE_BACK_URL}/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUserName(response.data.username || "Jenny Wilson");
        } catch (error) {
          console.error('Error fetching username:', error);
        }
      };
      fetchUsername();
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate('/LandingPage', { replace: true });
  };

  return (
    <div className="container-Navbar">
      <aside className="sidebar">
        <h2>  <img src={sparkimg} alt="Spark logo" /> Spark</h2>
        <nav>
          <ul className="nav-ul">
            <li><NavLink to="/dashboard"> <button className="btn">Dashboard</button></NavLink></li>
            <li><NavLink to="/dashboard/Appearance"><button className="btn">Appearance</button></NavLink></li>
            <li><NavLink to="/dashboard/Analytics"><button className="btn">Analytics</button></NavLink></li>
            <li><NavLink to="/dashboard/Settings"><button className="btn">Settings</button></NavLink></li>
          </ul>
        </nav>
        
        <button className="logout-button" onClick={handleLogout}>
        <div className="user-info">{userName}</div>
        </button>
      </aside>
    </div>
  );
};

export default Navbar;