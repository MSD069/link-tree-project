import React, { useState, useEffect } from 'react';
import Mobile from '../components/Mobile';
import { useSettings } from '../context/SettingsContext';
import './AppearancePage.css';
import avatarimg from '../assets/Avatar.png';
import { toast } from 'react-toastify';

const ColorPicker = ({ label, value, onChange }) => {
  const handleClick = () => {
    const input = document.createElement('input');
    input.type = 'color';
    input.value = value;
    input.onchange = (e) => {
      onChange(e.target.value);
    };
    input.click();
  };

  return (
    <div className="color-picker-container">
      <label className="color-picker-label">{label}</label>
      <div className="color-swatch" style={{ backgroundColor: value }}></div>
      <div className="color-code" onClick={handleClick}>{value}</div>
    </div>
  );
};

const AppearancePage = () => {
  const { settings, setSettings, saveSettings, links } = useSettings();
  const [isSaving, setIsSaving] = useState(false);

  const airThemes = [
    { id: 'air-snow', name: 'Air Snow', bg: '#ffffff', lines: '#000000', buttonBg: '#000000', buttonFont: '#FFFFFF' },
    { id: 'air-grey', name: 'Air Grey', bg: '#f8f9fa', lines: '#dee2e6', buttonBg: '#dee2e6', buttonFont: '#000000' },
    { id: 'air-smoke', name: 'Air Smoke', bg: '#343a40', lines: '#ffffff', buttonBg: '#ffffff', buttonFont: '#343a40' },
    { id: 'air-black', name: 'Air Black', bg: '#000000', lines: '#343a40', buttonBg: '#343a40', buttonFont: '#ffffff' }
  ];

  const mineralThemes = [
    { id: 'mineral-blue', name: 'Mineral Blue', bg: '#e7f5ff', lines: '#339af0', buttonBg: '#339af0', buttonFont: '#ffffff' },
    { id: 'mineral-green', name: 'Mineral Green', bg: '#ebfbee', lines: '#40c057', buttonBg: '#40c057', buttonFont: '#ffffff' },
    { id: 'mineral-orange', name: 'Mineral Orange', bg: '#fff4e6', lines: '#ff922b', buttonBg: '#ff922b', buttonFont: '#ffffff' }
  ];

  const buttonStyles = [
    { id: 'fill', name: 'Fill', type: 'fill' },
    { id: 'outline', name: 'Outline', type: 'outline' },
    { id: 'hard-shadow', name: 'Hard Shadow', type: 'hard-shadow' },
    { id: 'soft-shadow', name: 'Soft Shadow', type: 'soft-shadow' },
    { id: 'special-torn', name: 'Torn', type: 'special-torn' },
    { id: 'special-double', name: 'Double Line', type: 'special-double' }
  ];

  const layouts = [
    { id: 'list', name: 'Stack', icon: '≡' },
    { id: 'grid', name: 'Grid', icon: '▤' },
    { id: 'carousel', name: 'Carousel', icon: '▦' }
  ];

  const fonts = [
    { id: 'dm-sans', name: 'DM Sans' },
    { id: 'inter', name: 'Inter' },
    { id: 'roboto', name: 'Roboto' }
  ];

  const updateSettings = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleThemeSelect = (theme) => {
    setSettings(prev => ({
      ...prev,
      theme: theme.id,
      buttonColor: theme.buttonBg,
      buttonFontColor: theme.buttonFont
    }));
  };

  return (
    <div className="container">
      <div className="wrapper">
        <div className="preview-panel">
          <header>
            <h1>Hi, {settings.username || "Nickname"}!</h1>
            <p>{settings.bio}</p>
          </header>
          <Mobile
            image={settings.image || avatarimg} // Use Cloudinary URL (e.g., https://res.cloudinary.com/ml_default/image/upload/...) or fallback
            username={settings.username || 'Nickname'}
            bio={settings.bio}
            links={links}
            settings={settings}
            style={{
              backgroundColor: ([...airThemes, ...mineralThemes].find(t => t.id === settings.theme))?.bg || '#ffffff',
              color: ([...airThemes, ...mineralThemes].find(t => t.id === settings.theme))?.lines || '#000000'
            }}
          />
        </div>

        <div className="controls-panel">
          <div className="control-section">
            <h3 className="section-title">Layout</h3>
            <div className="layout-grid">
              {layouts.map(layout => (
                <button
                  key={layout.id}
                  className={`layout-button ${settings.layout === layout.id ? 'active' : ''}`}
                  onClick={() => updateSettings('layout', layout.id)}
                >
                  <span className="layout-icon">{layout.icon}</span>
                  {layout.name}
                </button>
              ))}
            </div>
          </div>

          <div className="control-section">
            <h3 className="section-title">Buttons</h3>
            <div className="button-style-grid">
              {buttonStyles.map(style => (
                <button
                  key={style.id}
                  className={`style-button ${style.type} ${settings.buttonStyle === style.id ? 'active' : ''}`}
                  onClick={() => updateSettings('buttonStyle', style.id)}
                >
                  {style.name}
                </button>
              ))}
            </div>
            <ColorPicker
              label="Button color"
              value={settings.buttonColor}
              onChange={(color) => updateSettings('buttonColor', color)}
            />
            <ColorPicker
              label="Button font color"
              value={settings.buttonFontColor}
              onChange={(color) => updateSettings('buttonFontColor', color)}
            />
          </div>

          <div className="control-section">
            <h3 className="section-title">Themes</h3>
            <div className="themes-container">
              <div className="theme-category">
                <h4 className="theme-category-title">Air</h4>
                <div className="theme-grid">
                  {airThemes.map(theme => (
                    <button
                      key={theme.id}
                      className={`theme-card ${settings.theme === theme.id ? 'active' : ''}`}
                      onClick={() => handleThemeSelect(theme)}
                    >
                      <div className="theme-preview" style={{ background: theme.bg }}>
                        {[1, 2, 3].map(line => (
                          <div
                            key={line}
                            className="theme-preview-line"
                            style={{ background: theme.lines }}
                          ></div>
                        ))}
                      </div>
                      <div className="theme-name">{theme.name.split(' ')[1]}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="theme-category">
                <h4 className="theme-category-title">Mineral</h4>
                <div className="theme-grid">
                  {mineralThemes.map(theme => (
                    <button
                      key={theme.id}
                      className={`theme-card ${settings.theme === theme.id ? 'active' : ''}`}
                      onClick={() => handleThemeSelect(theme)}
                    >
                      <div className="theme-preview" style={{ background: theme.bg }}>
                        {[1, 2, 3].map(line => (
                          <div
                            key={line}
                            className="theme-preview-line"
                            style={{ background: theme.lines }}
                          ></div>
                        ))}
                      </div>
                      <div className="theme-name">{theme.name.split(' ')[1]}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="control-section">
            <h3 className="section-title">Fonts</h3>
            <select
              className="font-picker"
              value={settings.font}
              onChange={(e) => updateSettings('font', e.target.value)}
            >
              {fonts.map(font => (
                <option key={font.id} value={font.name}>{font.name}</option>
              ))}
            </select>
          </div>

          <button
            className="save-button"
            disabled={isSaving}
            onClick={async () => {
              setIsSaving(true);
              try {
                await saveSettings(settings);
                toast.success('Settings saved successfully!', {
                  position: 'top-center',
                  autoClose: 3000
                });
              } catch (error) {
                toast.error('Error saving settings. Please try again.', {
                  position: 'top-center',
                  autoClose: 3000
                });
              } finally {
                setIsSaving(false);
              }
            }}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppearancePage;