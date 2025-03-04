import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSettings } from '../context/SettingsContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import './AnalyticsPage.css';
const VITE_BACK_URL = import.meta.env.VITE_BACK_URL;

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

const AnalyticsPage = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({
    linkClicks: 0,
    shopClicks: 0,
    ctaClicks: 0,
    trafficByDevice: { Linux: 0, Mac: 0, iOS: 0, Windows: 0, Android: 0, Others: 0 },
    sites: {},
    clicksByLink: [],
    clicksOverTime: {},
    filteredSites: {},
    linkClicksOverTime: {},
    shopClicksOverTime: {},
    ctaClicksOverTime: {},
  });
  const [token] = useState(localStorage.getItem('token') || null);
  const { settings } = useSettings();
  const [activeGraph, setActiveGraph] = useState('link'); // Default to 'link' for all-time visibility

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!token) {
        console.error('No token found. Please log in.');
        return;
      }
      try {
        const response = await axios.get(`${VITE_BACK_URL}/analytics`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { startDate, endDate },
        });
        setAnalyticsData({
          ...response.data,
          linkClicksOverTime: response.data.linkClicksOverTime || {},
          shopClicksOverTime: response.data.shopClicksOverTime || {},
          ctaClicksOverTime: response.data.ctaClicksOverTime || {},
        });
      } catch (error) {
        console.error('Error fetching analytics data:', error.response?.data || error.message);
      }
    };

    fetchAnalyticsData();
  }, [token, startDate, endDate]);

  const formatDate = (date) => {
    if (!date) return '';
    const options = { month: 'short', day: 'numeric' };
    const day = new Date(date).getDate();
    let suffix = 'th';
    if (day === 1 || day === 21 || day === 31) suffix = 'st';
    else if (day === 2 || day === 22) suffix = 'nd';
    else if (day === 3 || day === 23) suffix = 'rd';
    return `${new Date(date).toLocaleString('en-US', options)}${suffix}`;
  };

  const handleStartDateChange = (e) => setStartDate(e.target.value);
  const handleEndDateChange = (e) => setEndDate(e.target.value);

  const dateRangeText = startDate && endDate
    ? `${formatDate(startDate)} to ${formatDate(endDate)}`
    : 'All Time';

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const getClicksOverTime = (type) => {
    const data = type === 'link' ? analyticsData.linkClicksOverTime :
                type === 'shop' ? analyticsData.shopClicksOverTime :
                analyticsData.ctaClicksOverTime;
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const filtered = {};
      months.forEach(month => {
        const monthDate = new Date(`${month} 1, ${new Date().getFullYear()}`);
        if (monthDate >= start && monthDate <= end) {
          filtered[month] = data[month] || 0;
        }
      });
      return filtered;
    }
    return months.reduce((acc, month) => {
      acc[month] = data[month] || 0;
      return acc;
    }, {});
  };

  const lineChartData = {
    labels: Object.keys(getClicksOverTime(activeGraph)),
    datasets: [
      {
        label: `${activeGraph === 'link' ? 'Link' : activeGraph === 'shop' ? 'Shop' : 'CTA'} Clicks`,
        data: Object.values(getClicksOverTime(activeGraph)),
        fill: true,
        borderColor: '#000000',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        tension: 0.1,
        pointRadius: 0,
        borderWidth: 1,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: (value) => (value >= 1000 ? `${value / 1000}k` : value) },
        grid: { display: false },
        border: { display: false },
      },
      x: { grid: { display: false }, border: { display: false } },
    },
    plugins: {
      legend: { display: true },
      tooltip: { callbacks: { label: (context) => `${context.dataset.label}: ${context.parsed.y}` } },
    },
  };

  const barChartData = {
    labels: ['Linux', 'Mac', 'iOS', 'Windows', 'Android', 'Others'],
    datasets: [
      {
        label: 'Traffic by Device',
        data: Object.values(analyticsData.trafficByDevice),
        backgroundColor: ['#92FFC6', '#9BEBC1', '#165534', '#3EE58F', '#A1D4BA', '#21AF66'],
        borderColor: ['#92FFC6', '#9BEBC1', '#165534', '#3EE58F', '#A1D4BA', '#21AF66'],
        borderWidth: 1,
        borderRadius: { topLeft: 20, topRight: 20, bottomLeft: 20, bottomRight: 20 },
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: (value) => (value >= 1000 ? `${value / 1000}k` : value) },
        grid: { display: false },
        border: { display: false },
      },
      x: { grid: { display: false }, border: { display: false } },
    },
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (context) => `${context.dataset.label}: ${context.parsed.y}` } },
    },
  };

  const doughnutChartData = {
    labels: Object.keys(startDate && endDate ? analyticsData.filteredSites : analyticsData.sites),
    datasets: [
      {
        label: 'Sites',
        data: Object.values(startDate && endDate ? analyticsData.filteredSites : analyticsData.sites),
        backgroundColor: ['#165534', '#3EE58F', '#94E9B8', '#21AF66', '#A1D4BA', '#92FFC6'],
        borderColor: ['#165534', '#3EE58F', '#94E9B8', '#21AF66', '#A1D4BA', '#92FFC6'],
        borderWidth: 1,
      },
    ],
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (context) => `${context.label}: ${context.raw}` } },
    },
  };

  const linkClicksChartData = {
    labels: analyticsData.clicksByLink.map(link => link.title),
    datasets: [
      {
        label: 'Traffic by Links',
        data: analyticsData.clicksByLink.map(link => link.clicks),
        backgroundColor: ['#92FFC6', '#9BEBC1', '#165534', '#3EE58F', '#A1D4BA', '#21AF66'],
        borderColor: ['#92FFC6', '#9BEBC1', '#165534', '#3EE58F', '#A1D4BA', '#21AF66'],
        borderWidth: 1,
        borderRadius: { topLeft: 20, topRight: 20, bottomLeft: 20, bottomRight: 20 },
      },
    ],
  };

  const linkClicksChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: (value) => (value >= 1000 ? `${value / 1000}k` : value) },
        grid: { display: false },
        border: { display: false },
      },
      x: { grid: { display: false }, border: { display: false } },
    },
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (context) => `${context.dataset.label}: ${context.parsed.y}` } },
    },
  };

  if (!token) {
    return <div className="analytics-container">Please log in to view analytics.</div>;
  }

  return (
    <div className="analytics-container">
      <div className="overview">
        <header>
          <h1>Hi, {settings.username || "Nickname"}!</h1>
          <p>{settings.bio}</p>
        </header>
        <div className="date-filter">
          <label htmlFor="start-date">Date Range:</label>
          <input
            type="date"
            id="start-date"
            value={startDate || ''}
            onChange={handleStartDateChange}
            className="date-picker"
          />
          <span>to</span>
          <input
            type="date"
            id="end-date"
            value={endDate || ''}
            onChange={handleEndDateChange}
            min={startDate}
            className="date-picker"
          />
          <span>{dateRangeText}</span>
        </div>
      </div>

      <div className="stats">
        <button
          className="stat link-stats"
          style={{ backgroundColor: '#3EE58F' }}
          onClick={() => setActiveGraph('link')} // Always set to 'link', no toggle off
        >
          <h3>Clicks on Links</h3>
          <p>{analyticsData.linkClicks.toLocaleString()}</p>
        </button>
        <button
          className="stat shop-stats"
          style={{ backgroundColor: '#94E9B8' }}
          onClick={() => setActiveGraph('shop')}
        >
          <h3>Clicks on Shop</h3>
          <p>{analyticsData.shopClicks.toLocaleString()}</p>
        </button>
        <button
          className="stat cta-stats"
          style={{ backgroundColor: '#94E9B8' }}
          onClick={() => setActiveGraph('cta')}
        >
          <h3>CTA</h3>
          <p>{analyticsData.ctaClicks.toLocaleString()}</p>
        </button>
      </div>

      <div className="charts">
        <div className="total-clicks">
          <h2>{activeGraph === 'link' ? 'Link' : activeGraph === 'shop' ? 'Shop' : 'CTA'} Clicks Over Time</h2>
          <div style={{ height: '300px' }}>
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        <div className="traffic-charts">
          <div className="traffic-by-device">
            <h2>Traffic by Device</h2>
            <div style={{ height: '300px' }}>
              <Bar data={barChartData} options={barChartOptions} />
            </div>
          </div>
          <div className="sites">
            <h2>Sites</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '150px', height: '150px' }}>
                <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
              </div>
              <div>
                <ul>
                  {Object.entries(startDate && endDate ? analyticsData.filteredSites : analyticsData.sites).map(([site, count], index) => (
                    <li key={site} style={{ color: doughnutChartData.datasets[0].backgroundColor[index % 6] }}>
                      {site}: {count}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="traffic-by-links">
          <h2>Traffic by Links</h2>
          <div style={{ height: '300px' }}>
            <Bar data={linkClicksChartData} options={linkClicksChartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
