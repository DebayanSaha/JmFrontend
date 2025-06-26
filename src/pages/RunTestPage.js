import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import {
  FaFileUpload,
  FaPlay,
  FaDownload,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaHistory,
} from "react-icons/fa";
import {
  Box,
  Grid,
  Typography,
  Button,
  Autocomplete,
  TextField,
  Paper,
} from "@mui/material";

// Utility to safely format dates
function formatDateSafe(dateString) {
  if (!dateString) return "Unknown";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Unknown";
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
}

const RunTestPage = () => {
  const [availableFiles, setAvailableFiles] = useState([]);
  const [selectedFilename, setSelectedFilename] = useState("");
  const [resultFile, setResultFile] = useState(null);
  const [isResultReady, setIsResultReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [summaryOutput, setSummaryOutput] = useState("");

  useEffect(() => {
    const fetchJMXFiles = async () => {
      try {
        const res = await axiosInstance.get("/list-files?type=jmx");

        setAvailableFiles((res.data || []).map(file => file.filename));


      } catch (err) {
        console.error("Failed to fetch .jmx files:", err);
      }
    };

    const fetchJTLHistory = async () => {
      try {
        const res = await axiosInstance.get("/list-files?type=jtl");

        const parsedHistory = (res.data || []).map(file => ({
          filename: file.filename,
          date: formatDateSafe(file.datetime),
        }));
        setHistory(parsedHistory);

      } catch (err) {
        console.error("Error fetching JTL history:", err);
      }
    };

    fetchJMXFiles();
    fetchJTLHistory();
  }, []);

  const handleRunTest = async () => {
    if (!selectedFilename) {
      alert("Please select a JMX file to run the test");
      return;
    }

    setSummaryOutput("");

    setIsLoading(true);
    setStatusMessage(
      <span>
        <FaClock /> Running test...
      </span>
    );
    setResultFile(null);
    setIsResultReady(false);

    try {
      const res = await axiosInstance.post(
        `/run-test/${encodeURIComponent(selectedFilename)}`,
        {},
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const data = res.data;
      if (
        data.status === "success" ||
        data.message?.includes("started in background")
      ) {
        setStatusMessage(
          <span>
            <FaCheckCircle color="green" /> {data.message}
          </span>
        );
        const filename = data.result_file;
        setResultFile(filename);
        setSummaryOutput(data.summary_output);

        const interval = setInterval(async () => {
          try {
            await axiosInstance.head(`/download/${filename}`);
            clearInterval(interval);
            setIsResultReady(true);
            setStatusMessage(
              <span>
                <FaCheckCircle color="green" /> Test completed. Result is ready to download.
              </span>
            );

            const now = new Date().toLocaleString();
            const newEntry = {
              filename,
              date: now,
            };

            setHistory((prev) => {
              const updated = [
                newEntry,
                ...prev.filter((item) => item.filename !== filename),
              ];
              localStorage.setItem("runTestHistory", JSON.stringify(updated));
              return updated;
            });
          } catch {
            // Polling continues until file exists
          }
        }, 3000);
      } else {
        setStatusMessage(
          <span>
            <FaTimesCircle color="red" /> Error: {data.message}
          </span>
        );
      }
    } catch (err) {
      console.error("Run error:", err);
      setStatusMessage(
        <span>
          <FaTimesCircle color="red" /> Network Error: {err.message}
        </span>
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (filename) => {
    try {
      const res = await axiosInstance.get(`/download/${filename}`);

      if (res.data.status === "success" && res.data.download_url) {
        const url = res.data.download_url;

        // Open in a new tab — this triggers the browser's native download behavior
        window.open(url, "_blank");
      } else {
        alert(res.data.message || "Failed to get download URL.");
      }
    } catch (error) {
      console.error("Download error:", error);
      alert("Error downloading file.");
    }
  };


  const filteredHistory = history.filter((item) =>
    item.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="tp-root enhanced-bg">
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
         background: linear-gradient(to bottom, #FFE9D0, #FFF3E0);
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
          .tp-panels {
            gap: clamp(16px, 2vw, 24px) !important;
          }
        }
        @media (max-width: 1200px) {
          .tp-main {
            max-width: 100vw !important;
            padding: clamp(20px, 3vw, 32px) clamp(12px, 2vw, 16px) !important;
          }
          .tp-panels {
            gap: clamp(12px, 2vw, 20px) !important;
          }
          .tp-panel {
            padding: clamp(18px, 3vw, 24px) !important;
          }
        }
        @media (max-width: 900px) {
          .tp-main {
            padding: clamp(16px, 4vw, 24px) clamp(8px, 2vw, 12px) !important;
          }
          .tp-panels {
            gap: clamp(10px, 2vw, 16px) !important;
          }
          .tp-panel {
            padding: clamp(14px, 4vw, 20px) !important;
          }
          .tp-panel-title {
            font-size: clamp(16px, 4vw, 20px) !important;
          }
        }
        @media (max-width: 768px) {
          .tp-main {
            padding: clamp(12px, 3vw, 16px) clamp(4px, 2vw, 8px) !important;
          }
          .tp-panels {
            gap: clamp(8px, 2vw, 12px) !important;
          }
          .tp-panel {
            padding: clamp(10px, 3vw, 14px) !important;
          }
          .tp-panel-title {
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
          .tp-panels {
            gap: clamp(6px, 2vw, 10px) !important;
          }
          .tp-panel {
            padding: clamp(8px, 2vw, 12px) !important;
          }
          .tp-panel-title {
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
          .tp-panels {
            gap: clamp(4px, 2vw, 8px) !important;
          }
          .tp-panel {
            padding: clamp(6px, 2vw, 10px) !important;
          }
          .tp-panel-title {
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
          .tp-panels {
            gap: clamp(3px, 2vw, 6px) !important;
          }
          .tp-panel {
            padding: clamp(4px, 2vw, 8px) !important;
          }
          .tp-panel-title {
            font-size: clamp(11px, 8vw, 14px) !important;
          }
          .MuiButton-root {
            font-size: clamp(9px, 3vw, 11px) !important;
            padding: clamp(3px, 2vw, 6px) !important;
          }
        }
        /* Unauthenticated user styling */
        .MuiButton-root.unauthenticated {
          opacity: 0.6 !important;
          cursor: not-allowed !important;
        }
        .MuiButton-root.unauthenticated:hover {
          background: #ccc !important;
          box-shadow: none !important;
        }
        .MuiAutocomplete-root.unauthenticated .MuiOutlinedInput-root {
          opacity: 0.6;
          cursor: not-allowed;
        }
        @media (max-width: 1024px) {
          .tp-panels {
            flex-direction: column !important;
            gap: clamp(8px, 2vw, 16px) !important;
            align-items: stretch !important;
          }
          .tp-panel, .tp-panel-history, .tp-panel-chat {
            min-width: 0 !important;
            max-width: 100vw !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }
        }
        @media (min-width: 1025px) {
          .tp-main {
            margin-left: clamp(8px, 2vw, 20px);
          }
          .tp-panel.tp-panel-chat {
            max-width: clamp(580px, 56vw, 780px) !important;
          }
        }
      `}</style>

      <div className="tp-main" style={{
        width: '100%',
        maxWidth: '100vw',
        margin: '0 auto',
        padding: 'clamp(24px, 5vw, 40px) clamp(8px, 3vw, 32px) clamp(32px, 4vw, 48px) clamp(8px, 3vw, 32px)',
        position: 'relative',
        boxSizing: 'border-box',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'auto',
      }}>
        {/* Decorative SVG blob behind header */}
        <svg className="tp-header-blob" viewBox="0 0 320 160" fill="none" xmlns="http://www.w3.org/2000/svg" style={{
          position: 'absolute',
          top: '10px',
          left: '-60px',
          width: '320px',
          height: '160px',
          zIndex: 0,
          pointerEvents: 'none'
        }}>
          <ellipse cx="160" cy="80" rx="160" ry="80" fill="#FFE0B2" fillOpacity="0.7" />
        </svg>

        <div className="tp-header" style={{
          background: 'none',
          borderRadius: 'var(--tp-radius)',
          color: 'var(--tp-orange-dark)',
          padding: 'clamp(18px, 5vw, 40px) clamp(8px, 4vw, 32px) clamp(12px, 3vw, 32px) clamp(8px, 4vw, 32px)',
          marginBottom: 'clamp(0px, 1vw, 32px)',
          position: 'relative',
          zIndex: 1,
          width: '100%',
          boxSizing: 'border-box',
        }}>
          <div className="tp-header-title" style={{
            fontSize: 'clamp(1.5rem, 7vw, 2.2rem)',
            fontWeight: '900',
            color: 'var(--tp-orange-dark)',
            marginBottom: '8px',
            letterSpacing: '0.5px',
            whiteSpace: 'normal',
            overflowWrap: 'break-word',
            maxWidth: '100%',
            wordBreak: 'break-word',
          }}>
            Run JMeter Test
          </div>
          <div className="tp-header-desc" style={{
            fontSize: 'clamp(1rem, 3vw, 1.2rem)',
            fontWeight: '550',
            fontStyle: 'bold',
            opacity: '0.85',
            color: 'var(--tp-text)',
            whiteSpace: 'normal',
            overflowWrap: 'break-word',
          }}>
            Execute your performance tests seamlessly!
          </div>
        </div>

        <div className="tp-panels route-transition" style={{
          display: 'flex',
          gap: '24px',
          justifyContent: 'center',
          alignItems: 'flex-start',
          width: '100%',
          minWidth: 0,
          boxSizing: 'border-box',
          overflowX: 'auto',
        }}>

          {/* Test Runner Panel */}
          <div className="tp-panel tp-panel-chat card-transition" style={{
            background: 'var(--tp-white)',
            borderRadius: 'var(--tp-radius)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            animation: 'fadeIn 0.7s ease',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            flex: '2 1 0',
            minWidth: '0',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            cursor: 'default'
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
            }}>
            <div className="tp-panel-title" style={{
              fontSize: '20px',
              fontWeight: '700',
              color: 'var(--tp-orange-dark)',
              marginBottom: '20px',
              letterSpacing: '0.2px'
            }}>
              <FaFileUpload style={{ marginRight: '8px' }} />
              Select Test Plan
            </div>

            <div style={{ marginBottom: '24px' }}>
              <Autocomplete
                fullWidth
                options={availableFiles}
                getOptionLabel={(option) => option}
                value={selectedFilename || null}
                onChange={(event, newValue) => setSelectedFilename(newValue || "")}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select JMX File"
                    placeholder="Search or select a file"
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: 'var(--tp-white)',
                        fontSize: '16px',
                        padding: '4px',
                        '& fieldset': {
                          borderColor: 'var(--tp-border)',
                          borderWidth: '1.5px',
                        },
                        '&:hover fieldset': {
                          borderColor: '#FF6D00',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#FF6D00',
                          borderWidth: '2px',
                        },
                        '& input': {
                          padding: '16px 14px',
                          fontSize: '16px',
                        },
                        '& .MuiAutocomplete-endAdornment': {
                          right: '14px',
                        }
                      },
                      '& .MuiInputLabel-root': {
                        fontSize: '16px',
                        transform: 'translate(14px, 16px) scale(1)',
                        '&.Mui-focused, &.MuiFormLabel-filled': {
                          transform: 'translate(14px, -9px) scale(0.75)',
                        }
                      }
                    }}
                  />
                )}
              />
            </div>

            <div style={{
              display: 'flex',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <Button
                variant="contained"
                onClick={handleRunTest}
                disabled={isLoading}
                sx={{
                  background: isLoading ? '#ccc' : '#FF6D00',
                  color: 'white',
                  padding: '14px 32px',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(255, 109, 0, 0.3)',
                  transition: 'all 0.3s ease',
                  textTransform: 'none',
                  minWidth: '160px',
                  '&:hover': {
                    background: isLoading ? '#ccc' : '#e65c00',
                    boxShadow: isLoading ? 'none' : '0 6px 16px rgba(255, 109, 0, 0.4)',
                    transform: isLoading ? 'none' : 'translateY(-2px)'
                  },
                  '&:disabled': {
                    background: '#ccc',
                    transform: 'none',
                    boxShadow: 'none'
                  }
                }}
              >
                <FaPlay style={{ marginRight: '8px', fontSize: '16px' }} />
                {isLoading ? "Running..." : "Run Test"}
              </Button>

              <Button
                variant="outlined"
                onClick={handleDownload}
                disabled={!isResultReady}
                sx={{
                  color: '#FF6D00',
                  borderColor: '#FF6D00',
                  padding: '14px 32px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  textTransform: 'none',
                  minWidth: '160px',
                  boxShadow: '0 4px 12px rgba(255, 109, 0, 0.1)',
                  '&:hover': {
                    borderColor: '#e65c00',
                    color: '#e65c00',
                    background: 'rgba(255, 109, 0, 0.04)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(255, 109, 0, 0.25)'
                  },
                  '&:active': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(255, 109, 0, 0.2)'
                  },
                  '&:disabled': {
                    borderColor: '#666',
                    color: '#666',
                    transform: 'none',
                    boxShadow: 'none'
                  }
                }}
              >
                <FaDownload style={{ marginRight: '8px', fontSize: '16px' }} />
                Download Result (.jtl)
              </Button>
            </div>

            {statusMessage && (
              <div style={{
                padding: '16px',
                borderRadius: 'var(--tp-radius-sm)',
                background: 'var(--tp-gray)',
                color: 'var(--tp-text)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                {statusMessage}
              </div>
            )}

            {summaryOutput && (
              <div style={{
                marginTop: '20px',
                background: '#F9F9F9',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #E0E0E0',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                maxHeight: '300px',
                overflowY: 'auto'
              }}>
                <Typography variant="h6" style={{ marginBottom: '12px', color: '#FF6D00' }}>
                  Test Summary
                </Typography>
                {summaryOutput}
              </div>
            )}

          </div>

          {/* History Panel */}
          <div className="tp-panel tp-panel-history card-transition" style={{
            background: 'var(--tp-white)',
            borderRadius: 'var(--tp-radius)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            animation: 'fadeIn 0.7s ease',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            minWidth: '280px',
            maxWidth: '340px',
            flex: '1 1 320px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            cursor: 'default'
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
            }}>
            <div className="tp-panel-title" style={{
              fontSize: '20px',
              fontWeight: '700',
              color: 'var(--tp-orange-dark)',
              marginBottom: '20px',
              letterSpacing: '0.2px'
            }}>
              <FaHistory style={{ marginRight: '8px' }} />
              History
            </div>

            <div className="tp-history-search" style={{ marginBottom: '16px' }}>
              <TextField
                placeholder="Search files..."
                size="small"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
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
            </div>

            <div className="tp-history-list" style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              overflowY: 'auto',
              overflowX: 'hidden',
              maxHeight: '400px',
            }}>
              {filteredHistory.length > 0 ? (
                filteredHistory.map((item, idx) => (
                  <div key={idx} className="tp-history-card" style={{
                    background: 'var(--tp-gray)',
                    borderRadius: '12px',
                    padding: '16px 18px',
                    border: '1px solid var(--tp-border)',
                    transition: 'box-shadow 0.2s, transform 0.2s',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    position: 'relative',
                    wordBreak: 'break-all',
                    overflowWrap: 'anywhere',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(255, 153, 102, 0.13)';
                    e.currentTarget.style.transform = 'scale(1.01)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <div className="tp-history-filename" style={{ fontWeight: '600', fontSize: '15px', marginBottom: '4px', color: 'var(--tp-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {item.filename}
                      </div>
                      <div className="tp-history-meta" style={{ fontSize: '13px', color: '#888' }}>Ran: {item.date}</div>
                    </div>
                    <FaDownload
                      style={{
                        fontSize: '18px',
                        color: '#FF6D00',
                        cursor: 'pointer',
                        marginLeft: '8px',
                        transition: 'color 0.2s',
                      }}
                      title="Download file"
                      onClick={e => { e.stopPropagation(); handleDownload(item.filename); }}
                      onMouseEnter={e => e.currentTarget.style.color = '#e65c00'}
                      onMouseLeave={e => e.currentTarget.style.color = '#FF6D00'}
                    />
                  </div>
                ))
              ) : (
                <div className="tp-history-meta" style={{
                  fontSize: '13px',
                  color: '#888'
                }}>No tests run yet.</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RunTestPage;
