import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaPowerOff, FaClock, FaCog, FaSignOutAlt } from "react-icons/fa";
import axiosInstance from "../api/axiosInstance";
import { useAuthContext } from '../context/AuthContext';

const Header = ({ licenseStatus }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [license, setLicense] = useState("Loading...");
  const [isExpiringSoon, setIsExpiringSoon] = useState(false);
  const { isAuthenticated } = useAuthContext();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      setLicense("Unknown");
      return;
    }

    const now = new Date();
    const trialEnd = user.trial_ends_at ? new Date(user.trial_ends_at) : null;
    const paidEnd = user.paid_ends_at ? new Date(user.paid_ends_at) : null;

    if (paidEnd && paidEnd > now) {
      setLicense("Premium Active");
    } else if (trialEnd && trialEnd > now) {
      const daysLeft = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
      setIsExpiringSoon(daysLeft <= 7);

      const day = trialEnd.getDate();
      const suffix = (d) =>
        d > 3 && d < 21 ? "th" : ["st", "nd", "rd"][d % 10 - 1] || "th";
      const formatted = `${day}${suffix(day)} ${trialEnd.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      })}`;

      setLicense(`Trial Expires: ${formatted}`);
    } else {
      setLicense("Trial Expired");
    }
  }, []);

const handleLogout = () => {
  try {
    // Clear both localStorage and sessionStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("rememberMe");
    localStorage.removeItem("savedEmail");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    // Remove Authorization header globally
    delete axiosInstance.defaults.headers.common["Authorization"];
  } catch (err) {
    console.warn("Logout error:", err);
  } finally {
    // Redirect to login
    window.location.href = "/login";
  }
};





  const handleUpgrade = () => {
    setDropdownOpen(false);
    navigate("/payment");
  };

  return (
    <div
      className="page-navbar"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        height: "80px",
        padding: "0 20px",
        background: "linear-gradient(135deg, rgba(26, 26, 46, 0.95), rgba(22, 33, 62, 0.95))",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        color: "white",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
      }}
    >
      <div
        style={{
          fontSize: "24px",
          fontWeight: "bold",
          background: "linear-gradient(135deg, #667eea, #764ba2)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        JMeterAI
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 12px",
            background: isExpiringSoon ? "rgba(255, 152, 0, 0.1)" : "rgba(255, 255, 255, 0.1)",
            borderRadius: "8px",
            border: `1px solid ${isExpiringSoon ? "rgba(255, 152, 0, 0.3)" : "rgba(255, 255, 255, 0.2)"}`,
          }}
        >
          <FaClock
            style={{
              fontSize: "14px",
              color: isExpiringSoon ? "#ff9800" : "rgba(255, 255, 255, 0.7)",
            }}
          />
          <span
            style={{
              fontSize: "14px",
              fontWeight: "500",
              color: license === "Trial Expired" ? "#f44336" : isExpiringSoon ? "#ff9800" : "rgba(255, 255, 255, 0.7)",
            }}
          >
            {license}
          </span>
        </div>

        <div style={{ position: "relative" }}>
          <div
            onClick={() => setDropdownOpen((prev) => !prev)}
            style={{
              cursor: "pointer",
              padding: "12px",
              paddingBottom: "7px",
              borderRadius: "10px",
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <FaCog
              style={{
                fontSize: "18px",
                color: "rgba(255,255,255,0.8)",
                transform: dropdownOpen ? "rotate(90deg)" : "rotate(0deg)",
                transition: "transform 0.3s",
              }}
            />
          </div>

          {dropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "50px",
                right: 0,
                background: "linear-gradient(135deg, rgba(26,26,46,0.98), rgba(22,33,62,0.98))",
                borderRadius: "12px",
                padding: "clamp(8px, 2vw, 16px)",
                minWidth: "clamp(120px, 28vw, 200px)",
                zIndex: 10001,
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                border: "1px solid rgba(255,255,255,0.2)",
                fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
                maxWidth: "90vw",
                wordBreak: "break-word"
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "clamp(8px, 2vw, 12px)" }}>
                <div 
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "10px", 
                    cursor: "pointer", 
                    color: "#fff",
                    padding: "8px",
                    borderRadius: "6px",
                    transition: "all 0.2s ease",
                    ":hover": {
                      background: "rgba(255, 255, 255, 0.1)"
                    }
                  }}
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate('/profile');
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "rgba(255, 255, 255, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "transparent";
                  }}
                >
                  <FaUser style={{ color: "#667eea" }} /> Profile Settings
                </div>
                {license.includes("Premium") && (
                  <div 
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "10px", 
                      cursor: "pointer", 
                      color: "#fff",
                      padding: "8px",
                      borderRadius: "6px",
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "rgba(255, 255, 255, 0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "transparent";
                    }}
                  >
                    <FaClock style={{ color: "#4facfe" }} /> Premium Plan
                  </div>
                )}
                <div
                  onClick={handleUpgrade}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    cursor: "pointer",
                    color: "#fff",
                    background: "rgba(255,109,0,0.15)",
                    padding: "8px",
                    borderRadius: "6px",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "rgba(255,109,0,0.25)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "rgba(255,109,0,0.15)";
                  }}
                >
                  <FaUser style={{ color: "#FF6D00" }} /> Upgrade to Premium
                </div>
                <div style={{ height: "1px", background: "rgba(255,255,255,0.1)" }} />
                {isAuthenticated && (
                  <div
                    onClick={handleLogout}
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "10px", 
                      cursor: "pointer", 
                      color: "#fff",
                      padding: "8px",
                      borderRadius: "6px",
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "rgba(255, 255, 255, 0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "transparent";
                    }}
                  >
                    <FaSignOutAlt style={{ color: "#f5576c" }} /> Sign out
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @media (max-width: 1400px) {
          .page-navbar {
            height: clamp(70px, 8vw, 80px) !important;
            padding: 0 clamp(16px, 2vw, 24px) !important;
          }
          .page-navbar > div {
            font-size: clamp(1.8rem, 2.5vw, 2.2rem) !important;
          }
          .page-navbar span {
            font-size: clamp(0.9rem, 1.5vw, 1.1rem) !important;
          }
        }
        @media (max-width: 1200px) {
          .page-navbar {
            height: clamp(65px, 9vw, 75px) !important;
            padding: 0 clamp(12px, 2vw, 20px) !important;
          }
          .page-navbar > div {
            font-size: clamp(1.5rem, 3vw, 2rem) !important;
          }
          .page-navbar span {
            font-size: clamp(0.85rem, 1.8vw, 1rem) !important;
          }
        }
        @media (max-width: 900px) {
          .page-navbar {
            height: clamp(56px, 10vw, 70px) !important;
            padding: 0 clamp(8px, 2vw, 16px) !important;
          }
          .page-navbar > div {
            font-size: clamp(1.1rem, 5vw, 1.5rem) !important;
          }
          .page-navbar span {
            font-size: clamp(0.8rem, 2vw, 0.95rem) !important;
          }
        }
        @media (max-width: 768px) {
          .page-navbar {
            height: clamp(48px, 12vw, 60px) !important;
            padding: 0 clamp(4px, 2vw, 10px) !important;
          }
          .page-navbar > div {
            font-size: clamp(1.1rem, 5vw, 1.5rem) !important;
          }
          .page-navbar span {
            font-size: clamp(0.75rem, 2.5vw, 0.9rem) !important;
          }
          .page-navbar div[style*="display: flex"] {
            gap: clamp(8px, 2vw, 12px) !important;
          }
          .page-navbar div[style*="padding: 6px 12px"] {
            padding: clamp(4px, 1.5vw, 8px) clamp(8px, 2vw, 12px) !important;
          }
          .page-navbar div[style*="padding: 12px"] {
            padding: clamp(8px, 2vw, 12px) !important;
          }
        }
        @media (max-width: 600px) {
          .page-navbar {
            height: clamp(40px, 14vw, 52px) !important;
            padding: 0 clamp(2px, 2vw, 6px) !important;
          }
          .page-navbar > div {
            font-size: clamp(1rem, 6vw, 1.2rem) !important;
          }
          .page-navbar span {
            font-size: clamp(0.7rem, 2.5vw, 0.85rem) !important;
          }
          .page-navbar div[style*="display: flex"] {
            gap: clamp(6px, 2vw, 10px) !important;
          }
          .page-navbar div[style*="padding: 6px 12px"] {
            padding: clamp(3px, 1.5vw, 6px) clamp(6px, 2vw, 10px) !important;
          }
          .page-navbar div[style*="padding: 12px"] {
            padding: clamp(6px, 2vw, 10px) !important;
          }
          .page-navbar .settings-dropdown {
            min-width: 120px !important;
            font-size: 0.9rem !important;
            padding: 6px !important;
            max-width: 98vw !important;
          }
        }
        @media (max-width: 480px) {
          .page-navbar {
            height: clamp(36px, 16vw, 44px) !important;
            padding: 0 clamp(1px, 2vw, 4px) !important;
          }
          .page-navbar > div {
            font-size: clamp(0.95rem, 7vw, 1.1rem) !important;
          }
          .page-navbar span {
            font-size: clamp(0.65rem, 2.5vw, 0.8rem) !important;
          }
          .page-navbar div[style*="display: flex"] {
            gap: clamp(4px, 2vw, 8px) !important;
          }
          .page-navbar div[style*="padding: 6px 12px"] {
            padding: clamp(2px, 1.5vw, 4px) clamp(4px, 2vw, 8px) !important;
          }
          .page-navbar div[style*="padding: 12px"] {
            padding: clamp(4px, 2vw, 8px) !important;
          }
        }
        @media (max-width: 360px) {
          .page-navbar {
            height: clamp(32px, 18vw, 40px) !important;
            padding: 0 clamp(1px, 2vw, 3px) !important;
          }
          .page-navbar > div {
            font-size: clamp(0.9rem, 8vw, 1rem) !important;
          }
          .page-navbar span {
            font-size: clamp(0.6rem, 2.5vw, 0.75rem) !important;
          }
          .page-navbar div[style*="display: flex"] {
            gap: clamp(3px, 2vw, 6px) !important;
          }
          .page-navbar div[style*="padding: 6px 12px"] {
            padding: clamp(1px, 1.5vw, 3px) clamp(3px, 2vw, 6px) !important;
          }
          .page-navbar div[style*="padding: 12px"] {
            padding: clamp(3px, 2vw, 6px) !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Header;
