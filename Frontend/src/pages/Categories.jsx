import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CategorySelector.css";
import banner from "../assets/Banner.png";
import logo from "../assets/sparklogo.png";

const categories = [
  { name: "Business", icon: "📊" },
  { name: "Creative", icon: "🎨" },
  { name: "Education", icon: "📚" },
  { name: "Entertainment", icon: "🎵" },
  { name: "Fashion & Beauty", icon: "🧪" },
  { name: "Food & Beverage", icon: "🍕" },
  { name: "Government & Politics", icon: "⚖️" },
  { name: "Health & Wellness", icon: "🍎" },
  { name: "Non-Profit", icon: "💖" },
  { name: "Other", icon: "💗" },
  { name: "Tech", icon: "💻" },
  { name: "Travel & Tourism", icon: "✈️" },
];

const CategorySelector = () => {
  const [selected, setSelected] = useState("Business");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const hasCompletedCategory = localStorage.getItem("categoryCompleted");
    if (hasCompletedCategory) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleUsername = (e) => {
    setUsername(e.target.value);
  };

  const handleSubmit = async () => {
    if (!username.trim()) {
      alert("Please enter a username");
      return;
    }

    try {
      const token = localStorage.getItem("token"); // Ensure token is fetched from localStorage
      if (!token) {
        alert("Please log in to continue");
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:3000/api/save-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Ensure token is included
        },
        body: JSON.stringify({ username, category: selected }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("categoryCompleted", "true");
        alert("Username saved successfully!");
        navigate("/dashboard", { replace: true });
      } else {
        alert(`Error: ${data.message || "Failed to save username"}`);
      }
    } catch (error) {
      console.error("Error saving username:", error);
      alert("Failed to save username. Please try again. Error: " + error.message);
    }
  };

  return (
    <div className="category-container-parent">
      <div className="logo-container2">
        <img src={logo} alt="Spark logo" />
      </div>

      <div className="category-div">
        <h1>{selected}</h1>
        <input
          type="text"
          onChange={handleUsername}
          placeholder="Tell us your username"
          value={username}
        />
        <div className="category-container">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => setSelected(category.name)}
              className={`category-button ${selected === category.name ? "selected" : ""}`}
            >
              {category.icon} {category.name}
            </button>
          ))}
        </div>
        <button className="submit-btn" onClick={handleSubmit}>
          Continue
        </button>
      </div>
      <div className="category-banner">
        <img className="Banner-img" src={banner} alt="LinkTree" />
      </div>
    </div>
  );
};

export default CategorySelector;