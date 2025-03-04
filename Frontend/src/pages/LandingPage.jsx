import React from 'react'
import Sample from '../pages/sample'
import './LandingPage.css'
import { useNavigate } from 'react-router-dom';

import logo from '../assets/Frame.png'
import analyticsimg from '../assets/Analytics.png'
import revenue from '../assets/Div.png'
import song1 from '../assets/Song1.png'
import song2 from '../assets/Song2.png'
import song3 from '../assets/Song3.png'

import styles from "./Footer.module.css";


import twitter from "../assets/twitter.png";
import instagram from "../assets/instagram.png";
import youtube from "../assets/youtube.png";
import tiktok from "../assets/tiktok.png";
import linktee from "../assets/linktree.png";


const links = [
  "About Spark", "Blog", "Press", "Social Good", "Contact",
  "Careers", "Getting Started", "Features and How-Tos", "FAQs", "Report a Violation",
  "Terms and Conditions", "Privacy Policy", "Cookie Notice", "Trust Center"
];

// Social Media Icons
const socialIcons = [
  { src: twitter, alt: "Twitter" },
  { src: instagram, alt: "Instagram" },
  { src: youtube, alt: "YouTube" },
  { src: tiktok, alt: "TikTok" },
  { src: linktee, alt: "Linktree" }
];
const testimonials = [
  { id: 1, bg: "gray" },
  { id: 2, bg: "white" },
  { id: 3, bg: "white" },
  { id: 4, bg: "gray" },
];


export const LandingPage = () => {
  const navigate = useNavigate();
  const handleSignup = () => {
    navigate('/signup');
  };
  const handlelogin = () => {
    navigate('/login');
  };
  return (
    <div className='Main-container'>
      <header className='Main-header'>
        <img className='logo' src={logo} alt="logo" />
        <button className='Sign-up-free-btn' onClick={handleSignup}>
          Sign up free</button>
      </header>
      <section className='main-section'>
        <div className='Main-content'>
          <div className='container1'>
            <h1 className='Main-content-heading'>The easiest place to
              update and share your
              Connection</h1>
            <p className='Main-content-description'>
              Help your followers discover everything you re sharing
              all over the internet, in one simple place. They'll thank
              ou for it!
            </p>
            <button className='Free-spark-btn'> Get Your Free Spark</button>
          </div>
          <img className='analyticsimg' src={analyticsimg} alt="analytics" />
        </div>

        <div className='Main-content'>
          <img className='Div-p' src={revenue} alt="logo" />
          <div className='container1'>
            <h1 className='Main-content-heading'>
              Analyze your audience and keep your followers engaged
            </h1>
            <p className='Main-content-description'> Track your engagement over time, monitor revenue and learn what’s converting your audience. Make informed updates on the fly to keep them coming back.</p>
          </div>
          </div>
          <div className=' Main-content'>
          <div className='container1'>
            <h1 className='Main-content-heading'>
              Analyze your audience and keep your followers engaged
            </h1>
            <p className='Main-content-description'> Track your engagement over time, monitor revenue and learn what’s converting your audience. Make informed updates on the fly to keep them coming back.</p>
          </div>
          <div className='Song-img'>
              <img className='song-icon' src={song1} alt='Song '/>
              <img className='song-icon' src={song2} alt='Song '/>
              <img className='song-icon1' src={song3} alt='Song '/>
              <p className='description1'>
              Share your content in limitless ways on your Spark
            </p>
          </div>
        </div>

      </section>
      <section className={styles.customerSection}>
      <div className={styles.content}>
        <div className={styles.heads}>
        <h1 className={styles.heading1}>Here's what our</h1>
        <h1 className={styles.heading}>customer</h1>
        <h1 className={styles.heading1}>has to says</h1>
        </div>
        <button className={styles.button}>Read customer stories</button>
      </div>

      <div className={styles.description}>
        <span className={styles.icon}>✳</span>
        <p>
          <strong>[short description goes in here]</strong> lorem ipsum is a placeholder text to demonstrate.
        </p>
      </div>
      </section>
      <div className={styles.container}>
      {testimonials.map((item, index) => (
        <div
          key={index}
          className={`${styles.card} ${item.bg === "gray" ? styles.grayBg : ""}`}
        >
          <h3 className={styles.title}>Amazing tool! Saved me months</h3>
          <p className={styles.text}>
            This is a placeholder for your testimonials and what your client has to say. 
            Put them here and make sure it's 100% true and meaningful.
          </p>
          <div className={styles.footer1}>
            <div className={styles.avatar}></div>
            <div className={styles.info}>
              <p className={styles.name}>John Master</p>
              <p className={styles.position}>Director, Spark.com</p>
            </div>
          </div>
        </div>
      ))}
    </div>
    <h1 >
    All Link Apps and Integrations
            </h1>

    <div className={styles.ssc}>

    <Sample />
    </div>
   
      <footer className={styles.footer}>
        <div className={styles.container}>
          {/* Buttons */}
          <div className={styles.buttons}>
            <button className={styles.loginBtn}onClick={handlelogin}>Log in</button>
            <button className={styles.signupBtn}onClick={handleSignup}>Sign up free</button>
          </div>

          {/* Links Section */}
          <div className={styles.links}>
            <div className={styles.linkColumn}>
              {links.slice(0, 5).map((item, index) => (
                <p key={index}>{item}</p>
              ))}
            </div>
            <div className={styles.linkColumn}>
              {links.slice(5, 10).map((item, index) => (
                <p key={index}>{item}</p>
              ))}
            </div>
            <div className={styles.linkColumn}>
              {links.slice(10).map((item, index) => (
                <p key={index}>{item}</p>
              ))}
            </div>
          </div>

          {/* Acknowledgment Text */}
          <p className={styles.acknowledgment}>
            <strong>We acknowledge the Traditional Custodians</strong> of the land on which our office stands,
            The Wurundjeri people of the Kulin Nation, and pay our respects to Elders past, present, and emerging.
          </p>

          {/* Social Media Icons */}
          <div className={styles.socialIcons}>
            {socialIcons.map((icon, index) => (
              <img key={index} src={icon.src} alt={icon.alt} className={styles.icon} />
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
