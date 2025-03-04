import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Mobile from "../components/Mobile";
import "./ProfileView.css";
import avatarimg from "../assets/Avatar.png";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from 'uuid';

export default function ProfileView() {
  const { userId } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visitorId] = useState(() => {
    let id = localStorage.getItem('visitorId');
    if (!id) {
      id = uuidv4();
      localStorage.setItem('visitorId', id);
    }
    return id;
  });

  const fetchPublicProfile = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/profile/public/${userId}?t=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (response.status === 200) {
        console.log("Fetched profile data:", response.data); // Debug log
        setProfileData(response.data);
      }
    } catch (error) {
      setError(error.response ? error.response.data : error.message);
      console.error("Error fetching public profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkClick = async (linkId) => {
    try {
      await axios.post(
        `http://localhost:3000/links/${linkId}/click`,
        {},
        { headers: { 'x-visitor-id': visitorId } }
      );
    } catch (error) {
      console.error("Error tracking click:", error);
    }
  };

  const handleCTAClick = async () => {
    try {
      await axios.post(
        `http://localhost:3000/cta/click/${userId}`,
        {},
        { headers: { 'x-visitor-id': visitorId } }
      );
      toast.success("Connected successfully!", {
        position: "top-center",
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Error tracking CTA click:", error);
      toast.error("Failed to connect.", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Profile URL copied to clipboard!", {
        position: "top-center",
        autoClose: 3000,
        style: { backgroundColor: "#4caf50", color: "#ffffff" },
      });
    } catch (error) {
      toast.error("Failed to copy URL.", {
        position: "top-center",
        autoClose: 3000,
        style: { backgroundColor: "#f44336", color: "#ffffff" },
      });
    }
  };

  useEffect(() => {
    fetchPublicProfile();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!profileData) return <div>No profile data available.</div>;

  const { image, bio, links = [], settings } = profileData;

  console.log('ProfileView settings.backgroundColor:', settings?.backgroundColor);

  return (
    <div className="profile-view-container">
      <h1>User's Public Profile</h1>
        <button className="copy-button" onClick={handleCopy}>copy</button>
     
        <Mobile
          image={image || avatarimg}
          username={profileData.username || "User"}
          bio={bio}
          links={links.map(link => ({
            ...link,
            onClick: () => handleLinkClick(link._id),
          }))}
          settings={{
            backgroundColor: settings?.backgroundColor || '#000000',
            theme: settings?.theme || "air-snow",
            buttonStyle: settings?.buttonStyle || "fill",
            buttonColor: settings?.buttonColor || "#000000",
            buttonFontColor: settings?.buttonFontColor || "#FFFFFF",
            layout: settings?.layout || "list",
            font: settings?.font || "DM Sans",
          }}
          onCopy={handleCopy}
          onCTAClick={handleCTAClick}
        />
      </div>
    
  );
}