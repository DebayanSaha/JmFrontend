import { useState, useEffect } from "react";
import {
  Typography,
  IconButton,
  Box,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import {
  Close as CloseIcon,
  AssignmentTurnedIn,
  PlayCircle,
  Assessment,
} from "@mui/icons-material";
import axiosInstance from "../api/axiosInstance";

// Simulate fetching from backend (replace this with real fetch later)
const fetchBackendMetrics = async () => {
  try {
    const res = await axiosInstance.get("/user-metrics");
    return res.data;
  } catch (err) {
    console.warn("Backend not reachable. Using fallback values.");
    return {
      total_test_plans_generated: 0,
      total_tests_run: 0,
      total_analysis_reports: 0,
      total_test_plans_pct_change: 0,
      total_tests_run_pct_change: 0,
      total_analysis_reports_pct_change: 0,
    };
  }
};

const Dashboard = () => {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    const loadMetrics = async () => {
      const data = await fetchBackendMetrics();

      const makeInfoText = (percent) => {
        if (percent === 0) return "No change from last month";
        const isUp = percent > 0;
        return `${Math.abs(percent)}% ${isUp ? "up" : "down"} from last month`;
      };

      const newCards = [
    {
      id: 1,
      title: "Total Test Plans Generated",
          value: data.total_test_plans_generated || 0,
          info: makeInfoText(data.total_test_plans_pct_change),
      icon: <AssignmentTurnedIn fontSize="large" />,
    },
    {
      id: 2,
      title: "Total Tests Run",
          value: data.total_tests_run || 0,
          info: makeInfoText(data.total_tests_run_pct_change),
      icon: <PlayCircle fontSize="large" />,
    },
    {
      id: 3,
      title: "Intelligent Analysis Reports",
          value: data.total_analysis_reports || 0,
          info: makeInfoText(data.total_analysis_reports_pct_change),
      icon: <Assessment fontSize="large" />,
    },
      ];

      setCards(newCards);
    };

    loadMetrics();
  }, []);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);

  const handleRemoveCard = (id) => {
    setCards((prev) => prev.filter((card) => card.id !== id));
  };

  const sidebarWidth = sidebarOpen || sidebarHovered ? 280 : 70;

  return (
    <>
      <main
        style={{
          flexGrow: 1,
          padding: "20px",
          marginLeft: "0",
          marginTop: "0",
          width: `calc(100vw - ${sidebarWidth}px)`,
          minHeight: "calc(100vh - 80px)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          boxSizing: "border-box",
          position: "relative",
          zIndex: 1,
          background: "linear-gradient(to bottom, #FFF8F1, #FFF1E6)",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        <div
          style={{
            marginBottom: "20px",
            padding: "24px",
            width: "100%",
            boxSizing: "border-box",
            position: "relative",
          }}
        >
          <svg
            style={{
              position: "absolute",
              top: "-40px",
              left: "-60px",
              width: "320px",
              height: "160px",
              zIndex: 0,
              pointerEvents: "none",
            }}
            viewBox="0 0 320 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <ellipse
              cx="160"
              cy="80"
              rx="160"
              ry="80"
              fill="#FFE0B2"
              fillOpacity="0.7"
            />
          </svg>

          <Typography
            variant="h3"
            style={{
              color: "#FF6D00",
              fontWeight: "900",
              marginBottom: "12px",
              fontSize: "34px",
              letterSpacing: "0.5px",
              position: "relative",
              zIndex: 1,
            }}
          >
            Dashboard
          </Typography>
          <Typography
            variant="h6"
            style={{
              color: "#333333",
              fontWeight: "550",
              fontSize: "16px",
              fontStyle: "bold",
              letterSpacing: "0.3px",
              opacity: "0.85",
              position: "relative",
              zIndex: 1,
            }}
          >
            Welcome to Dynamic Admin
          </Typography>
        </div>

        <Grid container spacing={2} sx={{ maxWidth: "80%", margin: 0, flexWrap: "wrap" }}>
          {cards.map((card, index) => (
            <Grid item xs={12} sm={6} md={4} key={card.id} sx={{ minWidth: 0, flex: "1 1 0" }}>
              <Card
                sx={{
                  background:
                    "linear-gradient(135deg, rgba(255, 126, 95, 0.15) 0%, rgba(254, 180, 123, 0.15) 100%)",
                  backdropFilter: "blur(80px)",
                  border: "1px solid rgba(255, 126, 95, 0.2)",
                  borderRadius: "20px",
                  height: "clamp(180px, 28vw, 240px)",
                  boxShadow: "0 4px 12px rgba(255, 153, 102, 0.1)",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  cursor: "pointer",
                  overflow: "hidden",
                  animation: `fadeInUp 0.6s ease ${index * 0.1}s both`,
                  "&:hover": {
                    transform: "scale(1.015)",
                    boxShadow: "0 8px 24px rgba(255, 153, 102, 0.2)",
                  },
                }}
              >
                <CardContent
                  sx={{
                    padding: "clamp(16px, 3vw, 28px)",
                    height: "100%",
                    position: "relative",
                    zIndex: 2,
                  }}
                >
                  <IconButton
                    onClick={() => handleRemoveCard(card.id)}
                    sx={{
                      position: "absolute",
                      top: "16px",
                      right: "16px",
                      color: "#FF6D00",
                      background: "rgba(255, 109, 0, 0.1)",
                      width: "36px",
                      height: "36px",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        background: "rgba(255, 109, 0, 0.2)",
                        transform: "rotate(90deg) scale(1.2)",
                      },
                    }}
                  >
                    <CloseIcon sx={{ fontSize: "20px" }} />
                  </IconButton>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      marginBottom: "24px",
                      marginTop: "8px",
                    }}
                  >
                    <Box
                      sx={{
                        background: "rgba(255, 109, 0, 0.1)",
                        borderRadius: "16px",
                        padding: "16px",
                        flexShrink: 0,
                        boxShadow: "0 4px 12px rgba(255, 109, 0, 0.1)",
                        transition: "transform 0.3s ease",
                        "&:hover": {
                          transform: "rotate(15deg) scale(1.15)",
                        },
                      }}
                    >
                      <Box sx={{ fontSize: "32px", color: "#FF6D00" }}>
                        {card.icon}
                      </Box>
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: "clamp(1.1rem, 2vw, 1.25rem)",
                        fontWeight: "700",
                        lineHeight: "1.3",
                        flex: 1,
                        minWidth: 0,
                        overflow: "visible",
                        textOverflow: "unset",
                        letterSpacing: "0.3px",
                        color: "#FF6D00",
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                        display: "block",
                      }}
                    >
                      {card.title}
                    </Typography>
                  </Box>

                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: "900",
                      marginBottom: "12px",
                      fontSize: "34px",
                      letterSpacing: "1px",
                      color: "#333333",
                    }}
                  >
                    {card.value}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      opacity: 0.95,
                      fontSize: "14px",
                      fontWeight: "500",
                      letterSpacing: "0.2px",
                      color: "#666666",
                    }}
                  >
                    {card.info}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </main>

      <style>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(40px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (max-width: 900px) {
          .MuiTypography-h6 {
            white-space: normal !important;
            text-overflow: unset !important;
            word-break: break-word !important;
          }
        }
      `}</style>
    </>
  );
};

export default Dashboard;
