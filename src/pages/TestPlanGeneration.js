import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../api/axiosInstance";
import { Download, Send, User, Bot, MessageSquare } from "lucide-react";
import { FaDownload } from "react-icons/fa";
import { Autocomplete, TextField } from '@mui/material';

const TestPlanGeneration = () => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([
    {
      type: "bot",
      text: "Hello! I can help you create a JMeter test plan. What kind of test would you like to create?",
    },
  ]);
  const [jmxFilename, setJmxFilename] = useState("");
  const [history, setHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  const chatContainerRef = useRef(null);

  const inferTestType = (filename) => {
    const lower = filename.toLowerCase();
    if (lower.includes("load")) return "Load Test";
    if (lower.includes("api")) return "API";
    return "Other";
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chat]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const currentMessage = message;
    setChat((prev) => [...prev, { type: "user", text: currentMessage }]);
    setMessage(""); // Clear input immediately
    setIsLoading(true);
    setDownloadReady(false);

    try {
      const response = await axiosInstance.post("/generate-test-plan", {
        prompt: currentMessage,
      });

      if (response.data.status === "success") {
        const filename = response.data.jmx_filename;

        setChat((prev) => [
          ...prev,
          {
            type: "bot",
            text: "Test plan generated successfully! Click 'Download' to get the JMX file.",
          },
        ]);
        setJmxFilename(filename);
        setDownloadReady(true);

        const now = new Date().toLocaleString();
        const testType = currentMessage.toLowerCase().includes("load test")
          ? "Load Test"
          : currentMessage.toLowerCase().includes("api")
            ? "API"
            : "Other";

        setHistory((prev) => [
          { filename, date: now, testType },
          ...prev,
        ]);
      } else {
        setChat((prev) => [
          ...prev,
          {
            type: "bot",
            text: response.data.message || "Failed to generate test plan.",
          },
        ]);
      }
    } catch (error) {
      setChat((prev) => [
        ...prev,
        {
          type: "bot",
          text: `Error generating test plan: ${error.response?.data?.message || error.message
            }`,
        },
      ]);
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

  const fetchHistory = async () => {
    try {
      const res = await axiosInstance.get("/list-files?type=jmx");

      const parsedHistory = (res.data || []).map(file => ({
        filename: file.filename,
        date: formatDateSafe(file.datetime),
        testType: inferTestType(file.filename),
      }));
      setHistory(parsedHistory);

    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredHistory = history.filter((item) =>
    item.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="tp-root enhanced-bg">
      <div className="tp-main" style={{ position: 'relative', zIndex: 1 }}>
        {/* Decorative SVG blob behind header */}
        <svg className="tp-header-blob" viewBox="0 0 320 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="160" cy="80" rx="160" ry="80" fill="#FFE0B2" fillOpacity="0.7" />
        </svg>

        <div className="tp-header">
          <div className="tp-header-title">Create Test Plan</div>
          <div className="tp-header-desc">Unlocking Insights, Enhancing Precision!</div>
        </div>

        <div className="tp-panels route-transition">
          {/* ✅ Swapped: Generator Panel First */}
          <div className="tp-panel tp-panel-chat card-transition">
            <div className="tp-panel-title flex items-center gap-2">
              <MessageSquare size={18} />
              JMeter Test Generator
            </div>
            <hr className="tp-section-divider" />

            <div className="tp-download-section">
              <button
                className={`tp-btn-primary`}
                onClick={() => handleDownload(jmxFilename)}
                disabled={!downloadReady}
              >
                <Download className="inline mr-1" size={18} />
                Download JMX
              </button>
            </div>

            <div ref={chatContainerRef} className="tp-chat-container">
              {chat.map((msg, idx) => (
                <div
                  key={idx}
                  className={`tp-chat-bubble${msg.type === "user" ? " tp-chat-bubble-user" : ""}`}
                >
                  <div className="tp-chat-sender flex items-center gap-1">
                    {msg.type === "user" ? <User size={16} /> : <Bot size={16} />}
                    {msg.type === "user" ? "You" : "Assistant"}
                  </div>
                  <div className="tp-chat-bubble-content">{msg.text}</div>
                </div>
              ))}
            </div>

            <hr className="tp-section-divider" />

            <div className="tp-chat-input-row">
              <input
                type="text"
                className={`tp-chat-input`}
                placeholder={
                  isLoading
                    ? "Generating response..."
                    : "Type your message here..."
                }
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSend()}
                disabled={isLoading}
              />
              <button
                className={`tp-btn-primary`}
                onClick={handleSend}
                disabled={isLoading}
              >
                <Send size={16} className="inline mr-1" />
                {isLoading ? "..." : "Send"}
              </button>
            </div>
          </div>

          {/* ✅ History Panel Second (Right) */}
          <div className="tp-panel tp-panel-history card-transition">
            <div className="tp-panel-title">History</div>

            <div className="tp-history-search">
              <TextField
                placeholder="Search tests..."
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
              boxShadow: '0 2px 8px 0 rgba(255, 122, 0, 0.04)',
              position: 'relative',
            }}>
              {filteredHistory.length > 0 ? (
                filteredHistory.map((item, index) => (
                  <div
                    className="tp-history-card"
                    key={index}
                    style={{ cursor: "pointer", display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', wordBreak: 'break-all', overflowWrap: 'anywhere' }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <div className="tp-history-filename">{item.filename}</div>
                      <div className="tp-history-meta">Created: {item.date}</div>
                    </div>
                    <FaDownload
                      style={{ fontSize: '18px', color: '#FF6D00', cursor: 'pointer', marginLeft: '8px', transition: 'color 0.2s' }}
                      title="Download file"
                      onClick={e => { e.stopPropagation(); handleDownload(item.filename); }}
                      onMouseEnter={e => e.currentTarget.style.color = '#e65c00'}
                      onMouseLeave={e => e.currentTarget.style.color = '#FF6D00'}
                    />
                  </div>
                ))
              ) : (
                <div className="tp-history-meta">No test plans generated yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        body {
          background: linear-gradient(to bottom, #FFE9D0, #FFF3E0);
          font-family: 'Poppins', sans-serif;
          min-height: 100vh;
          margin: 0;
          padding: 0;
          overflow-x: hidden;
        }
        .container {
          max-width: 1200px;
          margin: auto;
          padding: 32px 24px;
        }
        .card {
          background: #FFFFFF;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 8px 24px rgba(255, 153, 102, 0.2);
          transition: all 0.3s ease-in-out;
        }
        .card:hover {
          transform: scale(1.015);
          box-shadow: 0 12px 32px rgba(255, 153, 102, 0.3);
        }
        .card-title {
          font-size: 20px;
          font-weight: 700;
          color: #FF6D00;
        }
        .chat-message {
          background: #FFF5E0;
          border-radius: 16px;
          padding: 16px;
          margin-bottom: 12px;
          color: #333;
        }
        button {
          background: #FF6D00;
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(255, 109, 0, 0.3);
          transition: all 0.3s ease-in-out;
        }
        button:hover {
          background: #e65c00;
          box-shadow: 0 6px 16px rgba(255, 109, 0, 0.4);
        }
        
        @media screen and (max-width: 768px) {
          .flex-layout {
            flex-direction: column;
          }
          .card {
            margin-bottom: 16px;
          }
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
        .enhanced-bg {
          min-height: 100vh;
          background: linear-gradient(rgb(255, 233, 208), rgb(255, 243, 224));
          font-family: var(--tp-font);
          color: var(--tp-text);
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .tp-main {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 70px 16px 44px 30px;
          position: relative;
          z-index: 1;
          background: linear-gradient(rgb(255, 233, 208), rgb(255, 243, 224));
        }
        .tp-header-blob {
          position: absolute;
          top: -14px;
          left: -32px;
          width: 320px;
          height: 160px;
          z-index: 0;
          pointer-events: none;
        }
        .tp-header {
          background: none;
          border-radius: var(--tp-radius);
          color: var(--tp-orange-dark);
          padding: 8px 16px 24px 8px;
          margin-bottom: 8px;
          margin-top: 0;
          margin-left: 0;
          position: relative;
          z-index: 1;
          font-family: var(--tp-font);
          width: 100%;
          box-sizing: border-box;
        }
        .tp-header-title {
          font-size: clamp(1.5rem, 4vw, 2.5rem);
          font-weight: 900;
          color: var(--tp-orange-dark);
          margin-bottom: 8px;
          letter-spacing: 0.5px;
          white-space: normal;
          overflow-wrap: break-word;
        }
        .tp-header-desc {
          font-size: clamp(1rem, 2vw, 1.25rem);
          font-weight: 550;
          font-style: bold;
          opacity: 0.85;
          color: var(--tp-text);
          white-space: normal;
          overflow-wrap: break-word;
        }
        .tp-panels {
          display: flex;
          gap: 24px;
          justify-content: center;
          align-items: flex-start;
          margin-top: 0;
          flex-direction: row;
          position: relative;
          z-index: 1;
        }
        .tp-panel {
          background: var(--tp-white);
          border-radius: var(--tp-radius);
          box-shadow: var(--tp-shadow);
          padding: 24px;
          display: flex;
          flex-direction: column;
          animation: fadeIn 0.7s ease;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .tp-panel:hover {
          box-shadow: var(--tp-shadow-hover);
          transform: scale(1.01);
        }
        .tp-panel-history {
          min-width: 280px;
          max-width: 340px;
          flex: 1 1 320px;
        }
        .tp-panel-chat {
          flex: 2 1 0;
          min-width: 0;
        }
        .tp-panel-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--tp-orange-dark);
          margin-bottom: 2px;
          letter-spacing: 0.2px;
        }
        .tp-divider {
          border: none;
          border-top: 1px solid var(--tp-border);
          margin: 18px 0 18px 0;
        }
        /* History Section */
        .tp-history-search {
          margin-bottom: 16px;
        }
        .tp-search-input,
        .tp-filter-select {
          width: 100%;
          border-radius: var(--tp-radius-sm);
          border: 1px solid var(--tp-border);
          padding: 12px;
          font-size: 15px;
          margin-bottom: 8px;
          background: var(--tp-white);
          transition: border 0.2s;
        }
        .tp-search-input:focus,
        .tp-filter-select:focus {
          outline: none;
          border: 2px solid var(--tp-orange);
        }
        .tp-history-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          overflow-y: auto;
          max-height: 400px;
          box-shadow: 0 2px 8px 0 rgba(255, 122, 0, 0.04);
          position: relative;
        }
        .tp-history-list::-webkit-scrollbar {
          width: 8px;
        }
        .tp-history-list::-webkit-scrollbar-thumb {
          background: var(--tp-orange-light);
          border-radius: 8px;
        }
        .tp-history-card {
          background: var(--tp-gray);
          border-radius: 12px;
          box-shadow: none; /* or something subtle but darker */

          padding: 16px 18px;
          border: 1px solid var(--tp-border);
          transition: box-shadow 0.2s, transform 0.2s;
          cursor: pointer;
          position: relative;
          animation: fadeIn 0.7s ease;
        }
        .tp-history-card:hover {
          box-shadow: var(--tp-shadow-hover);
          transform: scale(1.01);
        }
        .tp-history-filename {
          font-weight: 600;
          font-size: 15px;
          margin-bottom: 4px;
          color: var(--tp-text);
        }
        .tp-history-meta {
          font-size: 13px;
          color: #555;
          margin-bottom: 2px;

          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }


        .tp-history-type {
          display: inline-flex;
          align-items: center;
          font-size: 12px;
          color: var(--tp-orange);
          font-weight: 600;
          margin-top: 2px;
        }
        .tp-history-type-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--tp-orange);
          margin-right: 6px;
        }
        /* Chat Section */
        .tp-download-section {
          text-align: center;
          margin-bottom: 18px;
        }
        .tp-chat-container {
          background: var(--tp-gray);
          border-radius: 14px;
          padding: 18px 16px;
          min-height: 250px;
          max-height: 380px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-bottom: 8px;
          box-shadow: 0 2px 8px 0 rgba(255, 122, 0, 0.04);
          position: relative;
        }
        .tp-chat-container::-webkit-scrollbar {
          width: 8px;
        }
        .tp-chat-container::-webkit-scrollbar-thumb {
          background: var(--tp-orange-light);
          border-radius: 8px;
        }
        .tp-chat-container:after {
          content: '';
          display: block;
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 18px;
          pointer-events: none;
          background: linear-gradient(to bottom, rgba(255,255,255,0), #fff8f1 90%);
        }
        .tp-chat-bubble {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          max-width: 80%;
          animation: fadeIn 0.7s ease;
        }
        .tp-chat-bubble-user {
          align-self: flex-end;
          align-items: flex-end;
        }
        .tp-chat-sender {
          font-size: 12px;
          color: #888;
          margin-bottom: 2px;
          font-weight: 500;
        }
        .tp-chat-bubble-content {
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 15px;
          font-weight: 500;
          line-height: 1.5;
          background: var(--tp-orange-light);
          color: var(--tp-text);
          word-break: break-word;
        }
        .tp-chat-bubble-user .tp-chat-bubble-content {
          background: var(--tp-gray);
          color: var(--tp-text);
        }
        /* Chat Input */
        .tp-chat-input-row {
          display: flex;
          gap: 12px;
        }
        .tp-chat-input {
          flex: 1;
          border-radius: var(--tp-radius-sm);
          border: 2px solid #FF6D00;
          padding: 12px;
          font-size: 15px;
          background: var(--tp-white);
          transition: all 0.3s ease;
          box-shadow: 0 0 0 4px rgba(255, 109, 0, 0.1);
          position: relative;
          overflow: hidden;
        }
        .tp-chat-input::placeholder {
          color: rgba(255, 109, 0, 0.6);
          font-weight: 500;
        }
        .tp-chat-input:focus {
          outline: none;
          border-color: #FF6D00;
          box-shadow: 0 0 0 4px rgba(255, 109, 0, 0.2);
          transform: translateY(-1px);
        }
        .tp-chat-input:hover {
          border-color: #e65c00;
          box-shadow: 0 0 0 4px rgba(255, 109, 0, 0.15);
          transform: translateY(-1px);
        }
        .tp-btn-primary {
          background: var(--tp-orange);
          color: #fff;
          border: none;
          border-radius: var(--tp-radius-sm);
          padding: 12px 24px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s, box-shadow 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: var(--tp-btn-shadow);
        }
        .tp-btn-primary:disabled {
          background: #ccc;
          color: #fff;
          cursor: not-allowed;
        }
        .tp-btn-primary:not(:disabled):hover {
          background: var(--tp-orange-hover);
          box-shadow: 0px 8px 24px rgba(255, 122, 0, 0.4);
        }
        /* Section Divider */
        .tp-section-divider {
          border: none;
          border-top: 1px solid var(--tp-border);
          margin: 18px 0 18px 0;
        }
        /* Fade-in animation */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        /* Responsive */
        @media (max-width: 1024px) {
          .tp-panels {
            flex-direction: column;
            gap: 16px;
          }
        }
        @media (max-width: 767px) {
          .tp-main {
            padding: 16px 4px 8px 4px;
          }
          .tp-header {
            padding: 12px 4px 8px 4px;
            font-size: 18px;
          }
          .tp-panel {
            padding: 10px;
          }
        }
        @media (max-width: 480px) {
          .tp-main {
            padding: 8px 2px 4px 2px;
          }
          .tp-header {
            padding: 8px 2px 6px 2px;
            font-size: 15px;
          }
          .tp-panel {
            padding: 6px;
          }
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
        @media (max-width: 600px) {
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
          .tp-chat-bubble-content, .tp-search-input, .tp-filter-select, .tp-chat-input {
            font-size: clamp(12px, 3vw, 14px) !important;
            padding: clamp(8px, 2vw, 12px) !important;
          }
        }
        @media (max-width: 480px) {
          .tp-main {
            padding: clamp(8px, 2vw, 12px) clamp(2px, 2vw, 6px) !important;
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
          .tp-chat-bubble-content, .tp-search-input, .tp-filter-select, .tp-chat-input {
            font-size: clamp(11px, 3vw, 13px) !important;
            padding: clamp(6px, 2vw, 10px) !important;
          }
        }
        @media (max-width: 360px) {
          .tp-main {
            padding: clamp(6px, 2vw, 10px) clamp(1px, 2vw, 4px) !important;
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
          .tp-chat-bubble-content, .tp-search-input, .tp-filter-select, .tp-chat-input {
            font-size: clamp(10px, 3vw, 12px) !important;
            padding: clamp(4px, 2vw, 8px) !important;
          }
        }
      `}</style>
    </div>
  );
};

export default TestPlanGeneration;
