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
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";
import { useResponsive } from '../useResponsive';

function Sidebar({ isMobile, sidebarOpen, setSidebarOpen, isCollapsed, setIsCollapsed }) {
  const { isSm } = useResponsive();
  const location = useLocation();

  const [userData, setUserData] = useState({
    name: "User",
    organization: "Company",
  });

  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

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

  // Handle sidebar close animation on mobile
  useEffect(() => {
    if (!isMobile) return;
    if (!sidebarOpen) {
      setIsAnimatingOut(true);
      const timer = setTimeout(() => {
        setIsAnimatingOut(false);
      }, 300); // match transition duration
      return () => clearTimeout(timer);
    }
  }, [sidebarOpen, isMobile]);

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

  const sidebarWidth = isCollapsed ? 80 : 280;

  // Sidebar style with animation for mobile
  const sidebarStyle = {
    position: "fixed",
    left: 0,
    right: isMobile ? 0 : 'auto',
    top: isMobile ? 0 : 80,
    height: isMobile ? "100vh" : "calc(100vh - 80px)",
    width: isMobile ? "100vw" : sidebarWidth,
    minWidth: isMobile ? "100vw" : sidebarWidth,
    maxWidth: isMobile ? "100vw" : sidebarWidth,
    margin: 0,
    transform: isMobile
      ? (sidebarOpen && !isAnimatingOut
          ? 'translateX(0)'
          : 'translateX(-100%)')
      : 'none',
    opacity: isMobile
      ? (sidebarOpen && !isAnimatingOut ? 1 : 0)
      : 1,
    background: "linear-gradient(180deg, rgba(140, 20, 20, 1) 0%, rgb(162, 72, 27) 100%)",
    backdropFilter: "blur(25px) saturate(1.2)",
    borderRight: "1px solid rgba(255, 255, 255, 0.08)",
    zIndex: isMobile ? 10000 : 1200,
    display: isMobile
      ? (sidebarOpen || isAnimatingOut ? "block" : "none")
      : "block",
    overflow: "hidden",
    boxShadow: "4px 0 15px rgba(0, 0, 0, 0.25), inset -1px 0 0 rgba(255, 255, 255, 0.04)",
    boxSizing: 'border-box',
    transition: isMobile
      ? 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      : 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  return (
    <aside style={sidebarStyle}>
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Toggle Button at the very top, always visible */}
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'flex-start', height: 56, padding: isCollapsed ? '0' : '0 0 0 8px' }}>
            <IconButton
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => setIsCollapsed(!isCollapsed)}
              style={{
                background: '#fff',
                color: '#a2481b',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid #eee',
                margin: isCollapsed ? '8px 0' : '8px 0 8px 0',
                transition: 'all 0.3s',
              }}
              size="small"
            >
              {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
            </IconButton>
          </div>
        )}
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
        {/* User Profile Section */}
        <div
          style={{
            pointerEvents: isCollapsed ? 'none' : 'auto',
            opacity: isCollapsed ? 0 : 1,
            transform: isCollapsed ? 'translateX(-16px)' : 'translateX(0)',
            transition: 'opacity 0.3s, transform 0.3s',
            height: isCollapsed ? 0 : 'auto',
            overflow: 'hidden',
            padding: isCollapsed ? 0 : '20px',
            margin: isCollapsed ? 0 : '8px 12px',
            borderRadius: isCollapsed ? 0 : '12px',
            textAlign: 'center',
            background: isCollapsed ? 'transparent' : 'rgba(255, 255, 255, 0.08)',
            backdropFilter: isCollapsed ? 'none' : 'blur(10px)',
            boxShadow: isCollapsed ? 'none' : 'inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
          }}
        >
          {!isCollapsed && (
            <>
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
            </>
          )}
        </div>
        {/* Navigation */}
        <div style={{ margin: isCollapsed ? "0" : "0 8px", padding: isCollapsed ? "12px 0" : "20px 0" }}>
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
                      justifyContent: isCollapsed ? "center" : "flex-start",
                      padding: isCollapsed ? "12px 0" : "12px 20px",
                      color: "#fff",
                      textDecoration: "none",
                      borderLeft: isActive ? "3px solid #FF6D00" : "3px solid transparent",
                      background: isActive ? "rgba(255, 255, 255, 0.15)" : "transparent",
                      borderRadius: isCollapsed ? "8px" : "0 8px 8px 0",
                      transition: "all 0.3s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = isActive ? "rgba(255, 255, 255, 0.25)" : "rgba(255, 255, 255, 0.1)";
                      e.currentTarget.style.transform = isCollapsed ? "scale(1.08)" : "translateX(4px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isActive ? "rgba(255, 255, 255, 0.15)" : "transparent";
                      e.currentTarget.style.transform = isCollapsed ? "scale(1)" : "translateX(0px)";
                    }}
                  >
                    <i style={{ minWidth: "24px", color: "#FFB74D", display: "flex", justifyContent: "center" }}>{item.icon}</i>
                    <span
                      style={{
                        marginLeft: "16px",
                        fontSize: "14px",
                        fontWeight: "500",
                        opacity: isCollapsed ? 0 : 1,
                        transform: isCollapsed ? 'translateX(-16px)' : 'translateX(0)',
                        transition: 'opacity 0.3s, transform 0.3s',
                        display: isCollapsed ? 'none' : 'inline',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {!isCollapsed && item.name}
                    </span>
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
