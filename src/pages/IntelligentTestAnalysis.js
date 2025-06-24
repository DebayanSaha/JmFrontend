import { useEffect, useState } from "react";
import {
  Typography,
  Grid,
  Autocomplete,
  TextField,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Assessment,
  Email as EmailIcon,
  History as HistoryIcon,
  Search as SearchIcon,
  PlayArrow as AnalyzeIcon,
} from "@mui/icons-material";
import { FaDownload } from "react-icons/fa";
import axiosInstance from "../api/axiosInstance";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { LoginRequiredModal, checkAuthentication } from "../components/VerifiedPopup";

function IntelligentTestAnalysis() {
  const [selectedFilename, setSelectedFilename] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [history, setHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [availableFiles, setAvailableFiles] = useState([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(checkAuthentication());

  useEffect(() => {
    const onStorageChange = () => {
      setIsAuthenticated(checkAuthentication());
    };

    window.addEventListener("storage", onStorageChange);
    window.addEventListener("local-storage-changed", onStorageChange);

    return () => {
      window.removeEventListener("storage", onStorageChange);
      window.removeEventListener("local-storage-changed", onStorageChange);
    };
  }, []);

  const checkAuth = (action) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return false;
    }
    return true;
  };

  const handleAnalyze = async () => {
    if (!selectedFilename) {
      alert("Please select a JTL file to analyze");
      return;
    }

    if (!checkAuth("analyze")) return;

    setAnalyzing(true);
    try {
      const response = await axiosInstance.post("/analyzeJTL", {
        filename: selectedFilename,
      });

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      const markdownContent =
        response.data.analysis || JSON.stringify(response.data, null, 2);

      setAnalysisResult(markdownContent);
    } catch (error) {
      console.error("Error analyzing file:", error);
      alert("Error analyzing file: " + (error.response?.data?.error || error.message));
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDownload = async (filename) => {
    try {
      const res = await axiosInstance.get(`/download/${filename}`);
      if (res.data.status === "success" && res.data.download_url) {
        window.open(res.data.download_url, "_blank");
      } else {
        alert(res.data.message || "Failed to get download URL.");
      }
    } catch (error) {
      console.error("Download error:", error);
      alert("Error downloading file.");
    }
  };

  const handleEmail = async () => {
    const current = history.find((item) => item.filename);
    if (!current || !current.filename.endsWith(".md")) {
      alert("Please analyze a file first.");
      return;
    }

    if (!checkAuth("email")) return;

    try {
      const res = await axiosInstance.post("/sendEmail", {
        filename: current.filename,
      });

      if (res.data.success) {
        alert("Email sent successfully!");
      } else {
        alert("Failed to send email.");
      }
    } catch (error) {
      console.error("Email error:", error);
      alert("Error sending email.");
    }
  };

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const jtlRes = await axiosInstance.get("/list-files?type=jtl");
        const jtlFilenames = (jtlRes.data || []).map(f => f.filename);
        setAvailableFiles(jtlFilenames);

        const mdRes = await axiosInstance.get("/list-files?type=md");
        const mdHistory = (mdRes.data || []).map(f => ({
          filename: f.filename,
          date: new Date(f.last_modified).toLocaleString(),
        }));
        setHistory(mdHistory);
      } catch (err) {
        console.error("Failed to fetch files:", err);
      }
    };

    fetchFiles();
  }, []);

  const filteredHistory = history.filter((item) =>
    item.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );


  return (
    <div className="tp-root enhanced-bg">
      {/* Login Required Modal */}
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />



      <style>{`
        body {
          background: linear-gradient(to bottom, #FFE9D0, #FFF3E0);
          font-family: 'Poppins', sans-serif;
          min-height: 100vh;
          margin: 0;
          padding: 0;
          overflow-x: hidden;
        }
        .enhanced-bg {
          min-height: 100vh;
          background: var(--tp-orange-bg);
          font-family: var(--tp-font);
          color: var(--tp-text);
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        :root {
          --tp-orange: #FF7A00;
          --tp-orange-dark: #FF6D00;
          --tp-orange-hover: #e06600;
          --tp-orange-light: #FFF3E0;
          --tp-orange-bg: #FFF1E6;
          --tp-header-blob: #FFE0B2;
          --tp-white: #FFFFFF;
          --tp-gray: #F5F5F5;
          --tp-border: #E0E0E0;
          --tp-text: #333333;
          --tp-radius: 16px;
          --tp-radius-sm: 8px;
          --tp-shadow: 0px 8px 24px rgba(0,0,0,0.05);
          --tp-shadow-hover: 0px 12px 32px rgba(0,0,0,0.10);
          --tp-btn-shadow: 0px 4px 12px rgba(255, 122, 0, 0.3);
          --tp-font: 'Poppins', 'Inter', 'Segoe UI', Arial, sans-serif;
        }
        /* Enhanced Responsive Breakpoints */
        @media (max-width: 1400px) {
          .tp-main {
            max-width: 95vw !important;
            margin: 0 auto !important;
          }
          .MuiGrid-container {
            gap: clamp(16px, 2vw, 24px) !important;
          }
        }
        @media (max-width: 1200px) {
          .tp-main {
            max-width: 100vw !important;
            padding: clamp(20px, 3vw, 32px) clamp(12px, 2vw, 16px) !important;
          }
          .MuiGrid-container {
            gap: clamp(12px, 2vw, 20px) !important;
          }
          .MuiGrid-item {
            padding: clamp(12px, 2vw, 16px) !important;
          }
        }
        @media (max-width: 900px) {
          .tp-main {
            padding: clamp(16px, 4vw, 24px) clamp(8px, 2vw, 12px) !important;
          }
          .MuiGrid-container {
            gap: clamp(10px, 2vw, 16px) !important;
          }
          .MuiGrid-item {
            padding: clamp(10px, 2vw, 14px) !important;
          }
          .MuiTypography-h6 {
            font-size: clamp(16px, 4vw, 20px) !important;
          }
        }
        @media (max-width: 768px) {
          .tp-main {
            padding: clamp(12px, 3vw, 16px) clamp(4px, 2vw, 8px) !important;
          }
          .MuiGrid-container {
            gap: clamp(8px, 2vw, 12px) !important;
          }
          .MuiGrid-item {
            padding: clamp(8px, 2vw, 12px) !important;
          }
          .MuiTypography-h6 {
            font-size: clamp(14px, 5vw, 18px) !important;
          }
          .MuiButton-root {
            font-size: clamp(12px, 3vw, 14px) !important;
            padding: clamp(8px, 2vw, 12px) !important;
          }
        }
        @media (max-width: 600px) {
          .tp-main {
            padding: clamp(10px, 2vw, 14px) clamp(2px, 2vw, 6px) !important;
          }
          .MuiGrid-container {
            gap: clamp(6px, 2vw, 10px) !important;
          }
          .MuiGrid-item {
            padding: clamp(6px, 2vw, 10px) !important;
          }
          .MuiTypography-h6 {
            font-size: clamp(13px, 6vw, 16px) !important;
          }
          .MuiButton-root {
            font-size: clamp(11px, 3vw, 13px) !important;
            padding: clamp(6px, 2vw, 10px) !important;
          }
        }
        @media (max-width: 480px) {
          .tp-main {
            padding: clamp(8px, 2vw, 12px) clamp(1px, 2vw, 4px) !important;
          }
          .MuiGrid-container {
            gap: clamp(4px, 2vw, 8px) !important;
          }
          .MuiGrid-item {
            padding: clamp(4px, 2vw, 8px) !important;
          }
          .MuiTypography-h6 {
            font-size: clamp(12px, 7vw, 15px) !important;
          }
          .MuiButton-root {
            font-size: clamp(10px, 3vw, 12px) !important;
            padding: clamp(4px, 2vw, 8px) !important;
          }
        }
        @media (max-width: 360px) {
          .tp-main {
            padding: clamp(6px, 2vw, 10px) clamp(1px, 2vw, 3px) !important;
          }
          .MuiGrid-container {
            gap: clamp(3px, 2vw, 6px) !important;
          }
          .MuiGrid-item {
            padding: clamp(3px, 2vw, 6px) !important;
          }
          .MuiTypography-h6 {
            font-size: clamp(11px, 8vw, 14px) !important;
          }
          .MuiButton-root {
            font-size: clamp(9px, 3vw, 11px) !important;
            padding: clamp(3px, 2vw, 6px) !important;
          }
        }
        /* Unauthenticated user styling */
        button.unauthenticated {
          opacity: 0.6;
          cursor: not-allowed;
        }
        button.unauthenticated:hover {
          background: #ccc !important;
          box-shadow: none !important;
        }
        select.unauthenticated {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>

      <div className="tp-main" style={{
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "clamp(12px, 4vw, 32px) clamp(6px, 3vw, 24px) clamp(24px, 4vw, 40px) clamp(6px, 3vw, 24px)",
        position: "relative",
        zIndex: 1,
        boxSizing: "border-box",
        maxWidth: "100vw",
        overflowX: "hidden",
        minHeight: "100vh",
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Decorative SVG blob behind header */}
        <svg className="tp-header-blob" viewBox="0 0 320 160" fill="none" xmlns="http://www.w3.org/2000/svg" style={{
          position: "absolute",
          top: "-18px",
          left: "-18px",
          width: "clamp(180px, 60vw, 320px)",
          height: "clamp(90px, 30vw, 160px)",
          zIndex: 0,
          pointerEvents: "none"
        }}>
          <ellipse cx="160" cy="80" rx="160" ry="80" fill="#FFE0B2" fillOpacity="0.7" />
        </svg>

        <div className="tp-header" style={{
          background: "none",
          borderRadius: "16px",
          color: "#FF6D00",
          padding: "clamp(18px, 5vw, 40px) clamp(8px, 4vw, 32px) clamp(12px, 3vw, 32px) clamp(8px, 4vw, 32px)",
          marginBottom: "clamp(0px, 1vw, 8px)",
          position: "relative",
          zIndex: 1,
          width: '100%',
          boxSizing: 'border-box',
        }}>
          <div className="tp-header-title" style={{
            fontSize: "clamp(1.5rem, 7vw, 2.2rem)",
            fontWeight: "900",
            color: "#FF6D00",
            marginBottom: "4px",
            letterSpacing: "0.5px",
            whiteSpace: 'normal',
            overflowWrap: 'break-word',
          }}>
            Intelligent Test Analysis
          </div>
          <div className="tp-header-desc" style={{
            fontSize: "clamp(1rem, 3vw, 1.2rem)",
            fontWeight: "550",
            fontStyle: "bold",
            opacity: "0.85",
            color: "#333333",
            whiteSpace: 'normal',
            overflowWrap: 'break-word',
          }}>
            Unlocking Insights from JMeterAI Test Runs
          </div>
        </div>

        <Grid
          container
          spacing={2}
          style={{
            width: "100%",
            margin: 0,
            marginBottom: "-10px",
            maxWidth: "100%",
            boxSizing: "border-box",
            borderRadius: "16px",
            padding: "-15px",
            transition: "all 0.3s ease-in-out"
          }}
        >
          {/* File Selection & Actions Panel */}
          <Grid item xs={12} md={4} style={{
            padding: "16px",
            maxWidth: "100%"
          }}>
            <div style={{
              background: "white",
              backdropFilter: "blur(80px)",
              border: "1px solid rgba(255, 126, 95, 0.2)",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 8px 24px rgba(255, 153, 102, 0.2)",
              transition: "all 0.3s ease-in-out",
              marginBottom: "24px",
              cursor: "default",
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.015)";
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(255, 153, 102, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(255, 153, 102, 0.2)";
              }}>
              <Typography variant="h6" style={{
                fontSize: "20px",
                fontWeight: "700",
                color: "#FF6D00",
                marginBottom: "20px",
                letterSpacing: "0.2px"
              }}>
                <AnalyzeIcon style={{ marginRight: "8px", color: "#FF6D00" }} />
                Analyze JTL File
              </Typography>

              {/* File Selection */}
              <Autocomplete
                freeSolo
                options={availableFiles}
                value={selectedFilename}
                onInputChange={(event, newValue) => setSelectedFilename(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={!isAuthenticated ? "Please log in to select files..." : "Select JTL File"}
                    variant="outlined"
                    fullWidth
                    size="small"
                    disabled={!isAuthenticated}
                    InputProps={{
                      ...params.InputProps,
                      style: {
                        background: "#FFFFFF",
                        borderRadius: "8px",
                        fontSize: "15px",
                        marginBottom: "18px",
                      }
                    }}
                  />
                )}
                filterOptions={(options, { inputValue }) =>
                  options.filter((option) =>
                    option.toLowerCase().includes(inputValue.toLowerCase())
                  )
                }
              />


              {/* Action Buttons */}
              <button
                onClick={handleAnalyze}
                disabled={analyzing || !isAuthenticated}
                className={!isAuthenticated ? 'unauthenticated' : ''}
                style={{
                  width: "100%",
                  background: analyzing || !isAuthenticated ? "#ccc" : "#FF6D00",
                  color: "white",
                  padding: "12px 24px",
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: "600",
                  marginBottom: "16px",
                  cursor: analyzing || !isAuthenticated ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 12px rgba(255, 109, 0, 0.3)",
                  transition: "all 0.3s ease-in-out"
                }}
              >
                {analyzing ? "Analyzing..." : (!isAuthenticated ? "Please Log In" : "Analyze File")}
              </button>

              <div style={{
                display: "flex",
                gap: "8px"
              }}>
                <button
                  onClick={handleDownload}
                  disabled={!analysisResult || !isAuthenticated}
                  className={!isAuthenticated ? 'unauthenticated' : ''}
                  style={{
                    flex: 1,
                    background: "#FFFFFF",
                    color: "#FF6D00",
                    padding: "10px",
                    border: "1px solid #FF6D00",
                    borderRadius: "8px",
                    fontWeight: "600",
                    cursor: analysisResult && isAuthenticated ? "pointer" : "not-allowed",
                    opacity: analysisResult && isAuthenticated ? 1 : 0.5,
                    transition: "all 0.3s ease"
                  }}
                >
                  <FaDownload
                    style={{ marginRight: "4px", color: "#FF6D00", fontSize: 18 }}
                    title="Download file"
                    onClick={e => { e.stopPropagation(); handleDownload(selectedFilename); }}
                    onMouseEnter={e => e.currentTarget.style.color = '#e65c00'}
                    onMouseLeave={e => e.currentTarget.style.color = '#FF6D00'}
                  />
                  Download
                </button>

                <button
                  onClick={handleEmail}
                  disabled={!analysisResult || !isAuthenticated}
                  className={!isAuthenticated ? 'unauthenticated' : ''}
                  style={{
                    flex: 1,
                    background: "#FFFFFF",
                    color: "#FF6D00",
                    padding: "10px",
                    border: "1px solid #FF6D00",
                    borderRadius: "8px",
                    fontWeight: "600",
                    cursor: analysisResult && isAuthenticated ? "pointer" : "not-allowed",
                    opacity: analysisResult && isAuthenticated ? 1 : 0.5,
                    transition: "all 0.3s ease"
                  }}
                >
                  <EmailIcon style={{ marginRight: "4px" }} />
                  Email
                </button>
              </div>
            </div>

            {/* History Panel */}
            <div style={{
              background: "white",
              backdropFilter: "blur(80px)",
              border: "1px solid rgba(255, 126, 95, 0.2)",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 8px 24px rgba(255, 153, 102, 0.2)",
              transition: "all 0.3s ease-in-out",
              cursor: "default",
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.015)";
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(255, 153, 102, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(255, 153, 102, 0.2)";
              }}>
              <Typography variant="h6" style={{
                fontSize: "20px",
                fontWeight: "700",
                color: "#FF6D00",
                marginBottom: "20px",
                letterSpacing: "0.2px"
              }}>
                <HistoryIcon style={{ marginRight: "8px", color: "#FF6D00" }} />
                Analysis History
              </Typography>

              {/* Search Input */}
              <TextField
                placeholder="Search files..."
                size="small"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                    InputLabelProps={{ shrink: false }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 'var(--tp-radius-sm)',
                        backgroundColor: 'var(--tp-white)',
                        '& fieldset': {
                          borderColor: 'var(--tp-border)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'var(--tp-orange)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'var(--tp-orange)',
                        },
                      },
                    }}
              />






              {/* History List */}
              <div style={{
                maxHeight: "300px",
                overflowY: "auto"
              }}>
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "16px",
                        marginBottom: "8px",
                        background: "#F5F5F5",
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <Typography variant="body2" style={{ color: "#333333", fontWeight: "600", marginBottom: "4px" }}>
                          {item.filename}
                        </Typography>
                        <Typography variant="caption" style={{ color: "#666666" }}>
                          Analyzed: {item.date}
                        </Typography>
                      </div>
                      <FaDownload
                        style={{ fontSize: 18, color: '#FF6D00', cursor: 'pointer', marginLeft: 8, transition: 'color 0.2s' }}
                        title="Download file"
                        onClick={e => { e.stopPropagation(); handleDownload(item.filename); }}
                        onMouseEnter={e => e.currentTarget.style.color = '#e65c00'}
                        onMouseLeave={e => e.currentTarget.style.color = '#FF6D00'}
                      />
                    </div>
                  ))
                ) : (
                  <div style={{
                    textAlign: "center",
                    padding: "20px",
                    color: "#666666"
                  }}>
                    No analysis history yet
                  </div>
                )}
              </div>
            </div>
          </Grid>

          {/* Results Panel */}
          <Grid item xs={12} md={8} style={{
            padding: "16px",
            maxWidth: "100%"
          }}>
            <div style={{
              background: "white",
              backdropFilter: "blur(80px)",
              border: "1px solid rgba(255, 126, 95, 0.2)",
              borderRadius: "16px",
              padding: "24px",
              minHeight: "500px",
              boxShadow: "0 8px 24px rgba(255, 153, 102, 0.2)",
              transition: "all 0.3s ease-in-out",
              cursor: "default",
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.015)";
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(255, 153, 102, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(255, 153, 102, 0.2)";
              }}>
              <Typography variant="h6" style={{
                fontSize: "20px",
                fontWeight: "700",
                color: "#FF6D00",
                marginBottom: "20px",
                letterSpacing: "0.2px"
              }}>
                <Assessment style={{ marginRight: "8px", color: "#FF6D00" }} />
                Analysis Results
              </Typography>

              <div style={{
                background: "#F5F5F5",
                borderRadius: "12px",
                padding: "24px",
                minHeight: "400px",
                maxHeight: "600px",
                overflowY: "auto"
              }}>
                {analysisResult ? (
                  <ReactMarkdown
                    children={analysisResult}
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      h1: ({ children }) => (
                        <h1 style={{ color: "#FF6D00", marginBottom: "16px", fontSize: "24px" }}>{children}</h1>
                      ),
                      h2: ({ children }) => (
                        <h2 style={{ color: "#FF8A3D", marginBottom: "12px", fontSize: "20px" }}>{children}</h2>
                      ),
                      h3: ({ children }) => (
                        <h3 style={{ color: "#FF9B59", marginBottom: "10px", fontSize: "18px" }}>{children}</h3>
                      ),
                      p: ({ children }) => (
                        <p style={{ marginBottom: "12px", color: "#333333" }}>{children}</p>
                      ),
                      code: ({ children }) => (
                        <code style={{
                          background: "#FFE9D0",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          color: "#FF6D00"
                        }}>
                          {children}
                        </code>
                      ),
                      pre: ({ children }) => (
                        <pre style={{
                          background: "#FFF8F1",
                          padding: "16px",
                          borderRadius: "8px",
                          border: "1px solid #FFE0B2",
                          overflowX: "auto",
                          marginBottom: "16px"
                        }}>
                          {children}
                        </pre>
                      ),
                    }}
                  />
                ) : (
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    color: "#666666",
                    textAlign: "center"
                  }}>
                    <Assessment style={{
                      fontSize: "64px",
                      color: "#FFE0B2",
                      marginBottom: "16px"
                    }} />
                    <Typography variant="h6" style={{
                      color: "#FF6D00",
                      marginBottom: "8px"
                    }}>
                      {!isAuthenticated ? "Please Log In to Analyze" : "No Analysis Results Yet"}
                    </Typography>
                    <Typography variant="body2" style={{
                      color: "#666666"
                    }}>
                      {!isAuthenticated ? "Log in to access analysis features" : "Select a JTL file and click 'Analyze File' to see intelligent insights"}
                    </Typography>
                  </div>
                )}
              </div>
            </div>
          </Grid>
        </Grid>
      </div>
    </div>
  );
}

export default IntelligentTestAnalysis;
