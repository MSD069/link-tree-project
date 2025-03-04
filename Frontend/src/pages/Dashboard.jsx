import React from 'react'
import Navbar from '../components/Navbar'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import "./Dashboard.css"





const Dashboard = () => {
  return (
    <div className="container-dashboard">
        <Navbar />
        <Outlet />
        {/* <Route exact path="/dashboard/LinkPage" component={LinkPage} /> */}
       
    </div>
  )
}

export default Dashboard