import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    theme: 'air-snow',
    buttonStyle: 'fill',
    buttonColor: '#000000',
    buttonFontColor: '#FFFFFF',
    layout: 'list',
    font: 'DM Sans',
    image: '', // Cloudinary URL (e.g., https://res.cloudinary.com/ml_default/image/upload/...)
    bio: 'Bio',
    backgroundColor: '#000000',
    username: ''
  });
  const VITE_BACK_URL = import.meta.env.VITE_BACK_URL;
  const [links, setLinks] = useState([]);
  const [firstName, setFirstName] = useState(''); // Default to empty string
  const [lastName, setLastName] = useState(''); // Default to empty string
  const token = localStorage.getItem('token');

  const fetchLinks = async () => {
    try {
      const response = await axios.get(`${VITE_BACK_URL}/links`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLinks(response.data || []);
    } catch (error) {
      console.error('Error fetching links:', error);
    }
  };

  const fetchProfile = async () => {
    try {
      if (token) {
        const response = await axios.get(`${VITE_BACK_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const { username, profile , } = response.data;
        const { firstname, lastname, } = response.data || {}; // Handle potential missing data
        setFirstName(firstname || ''); // Ensure defaults
        setLastName(lastname || '');
        setSettings({
          ...settings,
          username: username || '',
          image: profile.image || '', // Use Cloudinary URL
          bio: profile.bio || 'Bio',
          backgroundColor: profile.backgroundColor || '#000000',
          theme: profile.theme || 'air-snow',
          buttonStyle: profile.buttonStyle || 'fill',
          buttonColor: profile.buttonColor || '#000000',
          buttonFontColor: profile.buttonFontColor || '#FFFFFF',
          layout: profile.layout || 'list',
          font: profile.font || 'DM Sans'
         
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
      fetchLinks();
    }
  }, [token]);

  const saveSettings = async (newSettings) => {
    try {
      const formData = new FormData();
      Object.entries(newSettings).forEach(([key, value]) => {
        if (key === 'image' && value instanceof File) {
          formData.append(key, value); // Handle file upload for image to Cloudinary
        } else {
          formData.append(key, value || '');
        }
      });

      const response = await axios.put(`${VITE_BACK_URL}/profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      const { username, profile } = response.data;
      setSettings({
        ...newSettings,
        username: username || newSettings.username,
        image: profile.image || newSettings.image, // Updated Cloudinary URL
        bio: profile.bio || newSettings.bio,
        backgroundColor: profile.backgroundColor || newSettings.backgroundColor
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  };

  const addLink = async (newLink) => {
    try {
      await axios.post(`${VITE_BACK_URL}/links`, newLink, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchLinks();
    } catch (error) {
      console.error('Error adding link:', error);
    }
  };

  const updateLink = async (linkId, updatedData) => {
    try {
      await axios.put(`${VITE_BACK_URL}/links/${linkId}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchLinks();
    } catch (error) {
      console.error('Error updating link:', error);
    }
  };

  const deleteLink = async (linkId) => {
    try {
      await axios.delete(`${VITE_BACK_URL}/links/${linkId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchLinks();
    } catch (error) {
      console.error('Error deleting link:', error);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, setSettings, saveSettings, links, addLink, updateLink, deleteLink, fetchLinks }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
