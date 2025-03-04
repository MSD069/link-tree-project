import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Mobile from "../components/Mobile";
import ShowLink from "./ShowLink";
import avatarimg from "../assets/Avatar.png";
import axios from "axios";
import { useSettings } from "../context/SettingsContext";
import "./LinkPage.css";
import { toast } from 'react-toastify';
const VITE_BACK_URL = import.meta.env.VITE_BACK_URL;

const LinkPage = () => {
  const [imagePreview, setImagePreview] = useState(avatarimg);
  const [imageFile, setImageFile] = useState(null);
  const [bio, setBio] = useState("Bio");
  const [editableUsername, setEditableUsername] = useState("");
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [userId, setUserId] = useState(null);
  const maxBioLength = 80;

  const navigate = useNavigate();
  const { settings = {}, saveSettings, links = [], firstName, lastName } = useSettings();

  const userfullName = firstName + " " + lastName;

  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${VITE_BACK_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { username, profile, userId } = response.data;
      setImagePreview(profile.image || avatarimg); // Use Cloudinary URL or default
      setBio(profile.bio || "Bio");
      setEditableUsername(username || "");
      setUserId(userId);
    } catch (error) {
      console.error("Error fetching profile:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        handleLogout();
      }
    }
  };

  const handleShareClick = () => {
    if (userId) {
      navigator.clipboard.writeText(`${window.location.origin}/profile/${userId}`);
      toast.success("Profile URL copied to clipboard!", {
        position: "top-center",
        autoClose: 3000,
      });
    } else {
      toast.error("User ID not found. Please try again.");
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result); // Preview locally before upload
        toast.success("Image uploaded successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(avatarimg);
    setImageFile(null); // Clear the file for upload
    toast.success("Image removed successfully!");
  };

  const handleUsernameEdit = () => {
    setIsEditingUsername(true);
  };

  const handleUsernameChange = (e) => {
    setEditableUsername(e.target.value);
  };

  const handleSave = async () => {
    if (!token) return;
    try {
      const updatedSettings = {
        username: editableUsername,
        bio,
        backgroundColor: settings.backgroundColor || "#000000",
        theme: settings.theme || 'air-snow',
        buttonStyle: settings.buttonStyle || 'fill',
        buttonColor: settings.buttonColor || '#000000',
        buttonFontColor: settings.buttonFontColor || '#FFFFFF',
        layout: settings.layout || 'list',
        font: settings.font || 'DM Sans',
      };

      if (imageFile) {
        updatedSettings.image = imageFile; // Pass the file for Cloudinary upload
      } else if (imagePreview === avatarimg) {
        updatedSettings.image = ''; // Explicitly remove the image
      }

      await saveSettings(updatedSettings);

      setIsEditingUsername(false);
      toast.success('Settings saved successfully!', {
        position: 'top-center',
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save: " + (error.response?.data?.message || "Please try again."), {
        position: 'top-center',
        autoClose: 3000,
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setBio("Bio");
    navigate("/LandingPage");
    toast.info("Logged out successfully!");
  };

  return (
    <div className="container-LinkPage">
      <div className="mobile-content">
        <header>
          <h1>Hi, {editableUsername || "Nickname"}!</h1>
          <p>{bio}</p>
        </header>
        <Mobile
          image={imagePreview} // Use preview (local or Cloudinary URL)
          username={editableUsername || "Nickname"}
          bio={bio}
          links={links}
          settings={settings}
        />
      </div>
      <main className="main-container">
        {token ? (
          <>
            <button className="share-button" onClick={handleShareClick}>
              Share Profile
            </button>
            <div className="profile-card">
              <section className="profile-Avatar-name">
                <div className="avatar-container">
                  <img src={imagePreview} alt="Avatar" className="avatar" />
                </div>
                <div className="buttons">
                  <label className="upload-btn">
                    Pick an image
                    <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
                  </label>
                  <button
                    className="remove-btn"
                    onClick={handleRemoveImage}
                    disabled={imagePreview === avatarimg}
                  >
                    Remove
                  </button>
                </div>
              </section>
              <div className="info-section">
                <div className="bio-container">
                  <div className="username-input-section">
                    {isEditingUsername ? (
                      <input
                        type="text"
                        value={editableUsername}
                        onChange={handleUsernameChange}
                        placeholder="Enter your username"
                        className="username-input"
                        autoFocus
                      />
                    ) : (
                      <p onClick={handleUsernameEdit} className="username-placeholder">
                        {editableUsername || "Click to edit username"}
                      </p>
                    )}
                  </div>
                  <input
                    type="text"
                    className="bio-input"
                    value={bio}
                    onChange={(e) => {
                      setBio(e.target.value);
                      saveSettings({ ...settings, bio: e.target.value });
                    }}
                    maxLength={maxBioLength}
                  />
                  <span className="char-count">
                    {bio.length} / {maxBioLength}
                  </span>
                </div>
              </div>
            </div>
            <div className="Show-Link">
              <ShowLink />
            </div>
            <section className="banner">
              <div className="banner-preview" style={{ backgroundColor: settings.backgroundColor || "#000000" }}>
                {imagePreview && <img src={imagePreview} alt=" " className="profile-image-banner" />}
                <p>{editableUsername || "@opopo_08"}</p>
                <p>{bio}</p>
              </div>
              <div className="color-picker-1">
                <button
                  onClick={() => saveSettings({ ...settings, backgroundColor: "#3C2A1E" })}
                  className="color-box brown"
                ></button>
                <button
                  onClick={() => saveSettings({ ...settings, backgroundColor: "#FFFFFF" })}
                  className="color-box white"
                ></button>
                <button
                  onClick={() => saveSettings({ ...settings, backgroundColor: "#000000" })}
                  className="color-box black"
                ></button>
                <div className="custom-color-picker-1">
                  <div
                    className="color-swatch1"
                    style={{ backgroundColor: settings.backgroundColor || "#000000" }}
                  ></div>
                  <button
                    className="color-button"
                    onClick={() => document.getElementById("colorPickerInput").click()}
                  >
                    {settings.backgroundColor || "#000000"}
                  </button>
                  <input
                    type="color"
                    id="colorPickerInput"
                    value={settings.backgroundColor || "#000000"}
                    onChange={(e) => saveSettings({ ...settings, backgroundColor: e.target.value })}
                    style={{ display: "none", cursor: "pointer" }}
                  />
                </div>
              </div>
            </section>
            <div className="action-buttons">
              <button className="save-button1" onClick={handleSave}>
                Save
              </button>
            </div>
          </>
        ) : (
          <div>
            <h2>Please log in to manage your profile and links</h2>
          </div>
        )}
      </main>
    </div>
  );
};

export default LinkPage;
