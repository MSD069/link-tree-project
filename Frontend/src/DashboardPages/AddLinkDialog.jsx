import React, { useState, useEffect } from "react";
import "./AddLinkDialog.css";

export default function AddLinkDialog({ onAdd, onClose, initialType, initialData }) {
  const [title, setTitle] = useState(initialData ? initialData.title : "");
  const [url, setUrl] = useState(initialData ? initialData.url : "");
  const [isActive, setIsActive] = useState(initialData ? initialData.isActive : false);
  const [currentSection, setCurrentSection] = useState(initialType || "link");
  const [error, setError] = useState(""); // State for error message

  // Update state when initialType or initialData changes
  useEffect(() => {
    setCurrentSection(initialType || "link");
    if (initialData) {
      setTitle(initialData.title);
      setUrl(initialData.url);
      setIsActive(initialData.isActive);
      setCurrentSection(initialData.type);
    }
  }, [initialType, initialData]);

  // Function to validate URL
  const validateUrl = (url) => {
    const urlPattern = /^(https?:\/\/)?([\w\d-]+\.)+[\w\d]{2,}(\/.*)?$/i;
    return urlPattern.test(url);
  };

  // Handle toggle active and URL submission
  const handleToggleActive = () => {
    const newActiveState = !isActive;
    setIsActive(newActiveState);

    if (title.trim() && url.trim()) {
      if (!validateUrl(url)) {
        setError("Please enter a valid URL (e.g., https://example.com)");
        return; // Prevent submission if URL is invalid
      }

      const data = {
        type: currentSection,
        title: title,
        url: url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`, // Ensure URL has protocol
        isActive: newActiveState,
      };
      onAdd(data);
      setTitle("");
      setUrl("");
      setIsActive(false);
      setError(""); // Clear error after successful submission
    } else {
      setError("Both title and URL are required");
    }
  };

  // Reset form fields
  const handleReset = () => {
    setTitle("");
    setUrl("");
    setIsActive(false);
    setError("");
  };

  // Toggle between Link and Shop sections
  const handleToggleSection = (section) => {
    setCurrentSection(section);
    setTitle("");
    setUrl("");
    setIsActive(false);
    setError("");
  };

  // Close dialog on outside click
  const handleOutsideClick = (e) => {
    if (e.target.className === "dialog-overlay") {
      onClose();
    }
  };

  // Clear error when user starts typing in URL field
  const handleUrlChange = (e) => {
    setUrl(e.target.value);
    if (error) setError(""); // Clear error on input change
  };

  return (
    <div className="dialog-overlay" onClick={handleOutsideClick}>
      <div className="dialog-box">
        <div className="button-group">
          <button
            className={`button ${currentSection === "link" ? "active" : "inactive"}`}
            onClick={() => handleToggleSection("link")}
          >
            Add Link
          </button>
          <button
            className={`button ${currentSection === "shop" ? "active" : "inactive"}`}
            onClick={() => handleToggleSection("shop")}
          >
            Add Shop
          </button>
        </div>
        <h3>Enter {currentSection === "link" ? "Link" : "Shop"} URL</h3>

        <div className="input-group">
          <input
            type="text"
            className="input"
            placeholder={currentSection === "link" ? "Link title" : "Shop name"}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div
            className={`toggle-switch ${isActive ? "active" : ""}`}
            onClick={handleToggleActive}
          />
        </div>

        <div className="input-group">
          <input
            type="text"
            className="input"
            placeholder={currentSection === "link" ? "Link URL" : "Shop URL"}
            value={url}
            onChange={handleUrlChange}
          />
          {error && <p className="error-message">{error}</p>}
        </div>

        <div className="icon-buttons">
          <button className="icon-button" onClick={handleReset}>
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
