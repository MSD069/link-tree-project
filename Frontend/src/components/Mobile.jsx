import React, { useState } from "react";
import "./Mobile.css";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";

const Mobile = ({
  image,
  username,
  bio,
  links = [],
  settings = {
    backgroundColor: '#000000',
    theme: 'air-snow',
    buttonStyle: 'fill',
    buttonColor: '#000000',
    buttonFontColor: '#FFFFFF',
    layout: 'list',
    font: 'DM Sans'
  },
  onCTAClick,
}) => {
  const [activeSection, setActiveSection] = useState("link");
  const navigate = useNavigate();
  

  const airThemes = {
    'air-snow': { bg: '#ffffff', lines: '#000000', buttonBg: '#000000', buttonFont: '#FFFFFF' },
    'air-grey': { bg: '#f8f9fa', lines: '#dee2e6', buttonBg: '#dee2e6', buttonFont: '#000000' },
    'air-smoke': { bg: '#343a40', lines: '#ffffff', buttonBg: '#ffffff', buttonFont: '#343a40' },
    'air-black': { bg: '#000000', lines: '#343a40', buttonBg: '#343a40', buttonFont: '#ffffff' }
  };

  const mineralThemes = {
    'mineral-blue': { bg: '#e7f5ff', lines: '#339af0', buttonBg: '#339af0', buttonFont: '#ffffff' },
    'mineral-green': { bg: '#ebfbee', lines: '#40c057', buttonBg: '#40c057', buttonFont: '#ffffff' },
    'mineral-orange': { bg: '#fff4e6', lines: '#ff922b', buttonBg: '#ff922b', buttonFont: '#ffffff' }
  };

  const currentTheme = airThemes[settings.theme] || mineralThemes[settings.theme] || { bg: '#ffffff', lines: '#000000', buttonBg: '#000000', buttonFont: '#FFFFFF' };

  const filteredLinks = Array.isArray(links)
    ? activeSection === "link"
      ? links.filter((item) => item.type === "link")
      : links.filter((item) => item.type === "shop")
    : [];

  const getButtonContainerClass = () => {
    switch (settings.layout) {
      case 'grid': return 'links-list grid';
      case 'carousel': return 'links-list carousel';
      default: return 'links-list';
    }
  };

  // Debug log for image URL
  console.log("Image URL in Mobile:", image);

  return (
    <div className="phone">
      <div
        className="card"
        style={{
          '--bg-color': currentTheme.bg,
          '--lines-color': currentTheme.lines,
          backgroundColor: currentTheme.bg,
          color: currentTheme.lines
        }}
      >
        <div className="header" style={{ backgroundColor: settings.backgroundColor || "#000000" }}>
          <img src={image || Avatarimg} alt="Profile" className="mobile-avatar" />
          <h2 className="username">{username || "Nickname"}</h2>
          {bio && <p className="bio">{bio}</p>}
        </div>
        <div className="tab-container" >
          <button
            className={`tab-button1 ${activeSection === "link" ? "active" : ""}`}
            onClick={() => setActiveSection("link")}
            style={{
              color: currentTheme.lines,
              backgroundColor: activeSection === "link" ? currentTheme.bg : 'transparent'
            }}
          >
            Link
          </button>
          <button
            className={`tab-button1 ${activeSection === "shop" ? "active" : ""}`}
            onClick={() => setActiveSection("shop")}
            style={{
              color: currentTheme.lines,
              backgroundColor: activeSection === "shop" ? currentTheme.bg : 'transparent'
            }}
          >
            Shop
          </button>
        </div>
        <div className={getButtonContainerClass()}>
          {filteredLinks.length === 0 ? (
            <p style={{ color: currentTheme.lines }}>No {activeSection === "link" ? "links" : "shops"} added yet.</p>
          ) : (
            filteredLinks.map((item, index) => (
              <a
                key={index}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`mobile-link ${settings.buttonStyle}`}
                style={{
                  '--button-color': settings.buttonColor,
                  '--button-font-color': settings.buttonFontColor,
                  backgroundColor: settings.buttonColor,
                  color: settings.buttonFontColor,
                  fontFamily: settings.font
                }}
                onClick={item.onClick}
              >
                {item.title}
              </a>
            ))
          )}
        </div>
        <button
          className={`connect-btn ${settings.buttonStyle}`}
          style={{
            '--button-color': settings.buttonColor,
            '--button-font-color': settings.buttonFontColor,
            backgroundColor: settings.buttonColor,
            color: settings.buttonFontColor,
            fontFamily: settings.font
          }}
          onClick={onCTAClick}
        >
          Get Connected
        </button>
        <div className="footer">
          <span className="spark-icon">🔥</span>
          <span className="spark-text" style={{ color: currentTheme.lines }}>SPARK</span>
        </div>
      </div>
    </div>
  );
};

export default Mobile;