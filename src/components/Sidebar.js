import { useEffect, useState } from "react";
import { IconButton, Typography } from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Assessment,
  Create as CreateIcon,
  PlayArrow as PlayArrowIcon,
  CurrencyExchange as CurrencyExchangeIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";
import { useResponsive } from '../useResponsive';

function Sidebar({ isMobile, sidebarOpen, setSidebarOpen }) {
  const { isSm } = useResponsive();
  const location = useLocation();

  const [userData, setUserData] = useState({
    name: "User",
    organization: "Company",
  });

  useEffect(() => {
  try {
    const localUser = JSON.parse(localStorage.getItem("user")) || {};
    setUserData({
      name: localUser.name ?? "User",
      organization: localUser.organization ?? "N/A",
    });
  } catch (err) {
    console.warn("Failed to parse local user:", err);
  }
}, []);

  const sidebarItems = [
    { name: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { name: "Create Test", icon: <CreateIcon />, path: "/test-plan-generation" },
    { name: "Run Test", icon: <PlayArrowIcon />, path: "/run-test" },
    { name: "Analysis", icon: <Assessment />, path: "/intelligent-test-analysis" },
    { name: "Pricing", icon: <CurrencyExchangeIcon />, path: "/payment" },
  ];

  const handleLinkClick = () => {
    setSidebarOpen(false);
  };

  const sidebarStyle = {
    position: "fixed",
    left: 0,
    right: isMobile ? 0 : 'auto',
    top: isMobile ? 0 : 80,
    height: isMobile ? "100vh" : "calc(100vh - 80px)",
    width: isMobile ? "100vw" : 280,
    margin: 0,
    transform: 'none',
    background: "linear-gradient(180deg, rgba(140, 20, 20, 1) 0%, rgb(162, 72, 27) 100%)",
    backdropFilter: "blur(25px) saturate(1.2)",
    borderRight: "1px solid rgba(255, 255, 255, 0.08)",
    zIndex: isMobile ? 10000 : 1200,
    display: isMobile ? (sidebarOpen ? "block" : "none") : "block",
    overflow: "hidden",
    boxShadow: "4px 0 15px rgba(0, 0, 0, 0.25), inset -1px 0 0 rgba(255, 255, 255, 0.04)",
    boxSizing: 'border-box',
  };

  return (
    <aside style={sidebarStyle}>
      {isMobile && (
        <button
          aria-label="Close sidebar"
          style={{
            position: 'absolute',
            top: 'clamp(8px, 2vw, 18px)',
            right: 'clamp(8px, 2vw, 18px)',
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: 'clamp(1.5rem, 6vw, 2.2rem)',
            zIndex: 10001,
            cursor: 'pointer',
          }}
          onClick={() => setSidebarOpen(false)}
        >
          &times;
        </button>
      )}
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {/* User Profile Section */}
        <div
          style={{
            padding: "20px",
            margin: "8px 12px",
            borderRadius: "12px",
            textAlign: "center",
            background: "rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(10px)",
            boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.1)",
            transition: "all 0.3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
            e.currentTarget.style.transform = "scale(1.03)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "#ffe7cc",
              margin: "0 auto 12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PersonIcon style={{ color: "#FF6D00", fontSize: "30px" }} />
          </div>
          <Typography style={{ color: "#fff", fontWeight: 600 }}>{userData.name}</Typography>
          <Typography style={{ color: "rgba(255, 255, 255, 0.85)", fontSize: "13px" }}>
            {userData.organization}
          </Typography>
        </div>

        {/* Navigation */}
        <div style={{ margin: "0 8px", padding: "20px 0" }}>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    onClick={handleLinkClick}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "12px 20px",
                      color: "#fff",
                      textDecoration: "none",
                      borderLeft: isActive ? "3px solid #FF6D00" : "3px solid transparent",
                      background: isActive ? "rgba(255, 255, 255, 0.15)" : "transparent",
                      borderRadius: "0 8px 8px 0",
                      transition: "all 0.3s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = isActive ? "rgba(255, 255, 255, 0.25)" : "rgba(255, 255, 255, 0.1)";
                      e.currentTarget.style.transform = "translateX(4px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isActive ? "rgba(255, 255, 255, 0.15)" : "transparent";
                      e.currentTarget.style.transform = "translateX(0px)";
                    }}
                  >
                    <i style={{ minWidth: "24px", color: "#FFB74D" }}>{item.icon}</i>
                    <span style={{ marginLeft: "16px", fontSize: "14px", fontWeight: "500" }}>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
