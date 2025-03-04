import React, { useState, useEffect, useRef } from "react";
import AddLinkDialog from "./AddLinkDialog";
import "./ShowLink.css";
import axios from "axios";
import { useSettings } from "../context/SettingsContext";
const VITE_BACK_URL = import.meta.env.VITE_BACK_URL;

export default function ShowLink() {
  const { links, addLink, updateLink, deleteLink, fetchLinks } = useSettings();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("link");
  const [filterType, setFilterType] = useState("all");
  const [editIndex, setEditIndex] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const editRef = useRef(null);

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem("token") || null);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleAddData = async (newData) => {
    if (!token) {
      console.error("No token found. Please log in.");
      alert("Please log in to add links.");
      return;
    }
    await addLink(newData);
    setIsDialogOpen(false);
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setFilterType(type);
  };

  const handleAddClick = () => {
    if (!token) {
      alert("Please log in to add links.");
      return;
    }
    setEditIndex(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (index) => {
    if (!token) {
      alert("Please log in to edit links.");
      return;
    }
    if (editIndex === null) {
      setEditIndex(index);
      setEditTitle(links[index].title);
      setEditUrl(links[index].url);
    }
  };

  const saveEdit = async () => {
    if (!token) {
      alert("Please log in to save edits.");
      return;
    }
    if (editIndex !== null && editTitle.trim() && editUrl.trim()) {
      const linkId = links[editIndex]._id;
      await updateLink(linkId, { title: editTitle, url: editUrl });
      setEditIndex(null);
    }
  };

  const handleDeleteClick = async (index) => {
    if (!token) {
      alert("Please log in to delete links.");
      return;
    }
    const linkId = links[index]._id;
    await deleteLink(linkId);
    setEditIndex(null);
  };

  const handleLinkClick = async (index) => {
    if (!token) {
      alert("Please log in to track link clicks.");
      return;
    }
    const linkId = links[index]._id;
    try {
      await axios.post(
        `${VITE_BACK_URL}/links/${linkId}/click`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchLinks(); // Refresh links to update click count
    } catch (error) {
      console.error("Error incrementing click:", error);
      alert("Failed to track click. Please try again.");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (editIndex !== null && editRef.current && !editRef.current.contains(event.target)) {
        saveEdit();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [editIndex, editTitle, editUrl]);

  const filteredLinks = filterType === "all"
    ? links
    : links.filter((item) => item.type === filterType);

  return (
    <div className="show-link-container">
      {token ? (
        <>
          <h2>Links and Shops</h2>
          <div className="button-group">
            <button
              className={`button ${selectedType === "link" ? "active" : "inactive"}`}
              onClick={() => handleTypeSelect("link")}
            >
              Add Link
            </button>
            <button
              className={`button ${selectedType === "shop" ? "active" : "inactive"}`}
              onClick={() => handleTypeSelect("shop")}
            >
              Add Shop
            </button>
          </div>
          <button className="add-button" onClick={handleAddClick}>
            Add
          </button>

          {isDialogOpen && (
            <AddLinkDialog
              onAdd={handleAddData}
              onClose={() => setIsDialogOpen(false)}
              initialType={selectedType}
            />
          )}

          <div className="link-list">
            {filteredLinks.length === 0 ? (
              <p>No {filterType === "link" ? "links" : filterType === "shop" ? "shops" : "links or shops"} added yet.</p>
            ) : (
              <ul>
                {filteredLinks.map((item, index) => (
                  <li key={index} className="link-item" ref={editIndex === index ? editRef : null}>
                    
                    <div>
                      <strong>{item.type === "link"}</strong>{" "}
                      {editIndex === index ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="edit-input"
                          autoFocus
                        />
                      ) : (
                        item.title
                      )}

                    </div>
                    <div>
                      {editIndex === index ? (
                        <input
                          type="text"
                          value={editUrl}
                          onChange={(e) => setEditUrl(e.target.value)}
                          className="edit-input"
                        />
                      ) : (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => handleLinkClick(index)}
                          className="link-url"
                        >
                          {item.url}
                        </a>
                      )}
                      <span className="edit-icon" onClick={() => handleEditClick(index)}>
                        ✏️
                      </span>
                      <span className="delete-icon" onClick={() => handleDeleteClick(index)}>
                        🗑️
                      </span>
                    </div>
                    <div>Clicks: {item.clicks || 0}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : (
        <div>Log in to manage links</div>
      )}
    </div>
  );
}
