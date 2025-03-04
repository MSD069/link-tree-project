import React, { useState } from 'react';
import banner from '../assets/Banner.png';
import logo from '../assets/Sparklogo.png';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './LoginPage.module.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const VITE_BACK_URL = import.meta.env.VITE_BACK_URL;
  console.log(VITE_BACK_URL);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      console.log("Submitting login form...");
      const res = await axios.post(`${VITE_BACK_URL}/login`, formData);
      console.log("Login response:", res.data);
      localStorage.setItem('token', res.data.token);
      console.log("Token set in localStorage:", localStorage.getItem("token"));
      navigate('/about', { replace: true });
      console.log("Navigated to /about");
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Something went wrong';
      setError(errorMsg);
      console.error("Login error:", errorMsg);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.logoContainer}>
        <img src={logo} alt="Spark logo" />
      </div>
      <div className={styles.loginSection}>
        <div className={styles.loginBox}>
          <h1 className={styles.title}>Sign in to your Spark</h1>
          <form onSubmit={handleSubmit} className={styles.loginForm}>
            <div className={styles.inputGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <button type="submit" className={styles.loginButton}>Log in</button>
            {error && <p className={styles.error}>{error}</p>}
          </form>
          <div className={styles.footer}>
            <p >don't have an account? Sign up</p>
            <p className={styles.disclaimer}>
              This site is protected by reCAPTCHA and the Google{' '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>{' '}
              and{' '}
              <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a>{' '}
              apply.
            </p>
          </div>
        </div>
      </div>
      <div className={styles.bannerSection}>
        <img src={banner} alt="Spark banner" className={styles.banner} />
      </div>
    </div>
  );
};

export default LoginPage;
