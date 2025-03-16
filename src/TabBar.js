import React from "react";
import { NavLink } from "react-router-dom";
import { FaHome, FaChartBar, FaUser } from "react-icons/fa";
import "./TabBar.css";

const TabBar = () => {
  return (
    <div className="tab-bar">
      <NavLink to="/analytics" className="tab-item">
        <FaChartBar />
      </NavLink>
      <NavLink to="/" className="tab-item home">
        <FaHome />
      </NavLink>
      <NavLink to="/profile" className="tab-item">
        <FaUser />
      </NavLink>
    </div>
  );
};

export default TabBar;
