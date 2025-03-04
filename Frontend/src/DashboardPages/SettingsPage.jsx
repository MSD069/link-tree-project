import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './SettingsPage.css';
import { useSettings } from '../context/SettingsContext';
const VITE_BACK_URL = import.meta.env.VITE_BACK_URL;

const SettingsPage = () => {
  const [firstName, setFirstName] = useState(''); // Default to empty string
  const [lastName, setLastName] = useState(''); // Default to empty string
  const [email, setEmail] = useState(''); // Default to empty string
  const [password, setPassword] = useState(''); // Default to empty string
  const [confirmPassword, setConfirmPassword] = useState(''); // Default to empty string
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true); // Add loading state

   const { settings } = useSettings();

  // Fetch current user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${VITE_BACK_URL}/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { firstname, lastname, email } = response.data || {}; // Handle potential missing data
        setFirstName(firstname || ''); // Ensure defaults
        setLastName(lastname || '');
        setEmail(email || '');
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load user data');
      } finally {
        setLoading(false); // Stop loading once data is fetched or failed
      }
    };
    fetchUserData();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const updateData = { firstname: firstName, lastname: lastName, email };
      if (password) {
        updateData.password = password;
        updateData.confirmPassword = confirmPassword;
      }
      await axios.put(`${VITE_BACK_URL}/update-profile`, updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Profile updated successfully');
      setError('');
      setPassword(''); // Clear password fields after successful update
      setConfirmPassword('');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Show loading while fetching data
  }

  return (
    <section className="settings-section">
      <header>
          <h1> Hi, {settings.username || "Nickname"}!</h1>
          <p>{settings.bio}</p>
        </header>
    <div className="settings-container">
      <h2 className="settings-title">Edit Profile</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group1">
        <div className="form-group">
          <label htmlFor="firstName">First name</label>
          <input
            type="text"
            id="firstName"
            value={firstName || ''} // Ensure value is always defined
            onChange={(e) => setFirstName(e.target.value)}
            required
            disabled={loading} // Disable inputs while loading
          />
        </div>
        <div className="form-group">
          <label htmlFor="lastName">Last name</label>
          <input
            type="text"
            id="lastName"
            value={lastName || ''} // Ensure value is always defined
            onChange={(e) => setLastName(e.target.value)}
            required
            disabled={loading} // Disable inputs while loading
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email || ''} // Ensure value is always defined
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading} // Disable inputs while loading
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password || ''} // Ensure value is always defined
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            disabled={loading} // Disable inputs while loading
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword || ''} // Ensure value is always defined
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            disabled={loading} // Disable inputs while loading
          />
        </div>
        </div>

        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="save-button3" disabled={loading}>
          Save
        </button>
      </form>
    </div>
    </section>
  );
};

export default SettingsPage;
