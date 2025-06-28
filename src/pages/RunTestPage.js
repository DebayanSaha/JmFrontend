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
  FaChartPie,
  FaChartLine,
  FaChartBar,
} from "react-icons/fa";
import {
  Box,
  Grid,
  Typography,
  Button,
  Autocomplete,
  TextField,
  Paper,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

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

// Utility to parse summary output and format as table data
function parseSummaryOutput(summaryText) {
  if (!summaryText) return [];

  const lines = summaryText.split('\n');
  const summaryData = [];

  lines.forEach(line => {
    if (line.trim().startsWith('summary')) {
      // Parse summary line: summary + 1 in 00:00:02 = 0.5/s Avg: 62 Min: 62 Max: 62 Err: 1 (100.00%) Active: 20 Started: 20 Finished: 0
      const match = line.match(/summary\s*([+=])\s*(\d+)\s+in\s+(\d{2}:\d{2}:\d{2})\s*=\s*([\d.]+)\/s\s+Avg:\s*(\d+)\s+Min:\s*(\d+)\s+Max:\s*(\d+)\s+Err:\s*(\d+)\s*\(([\d.]+)%\)\s*(?:Active:\s*(\d+)\s+Started:\s*(\d+)\s+Finished:\s*(\d+))?/);

      if (match) {
        const requests = parseInt(match[2]);
        const errors = parseInt(match[8]);
        const errorRate = parseFloat(match[9]);
        const avgResponse = parseInt(match[5]);
        const minResponse = parseInt(match[6]);
        const maxResponse = parseInt(match[7]);

        // Calculate additional metrics
        const successRate = 100 - errorRate;
        const responseTimeRange = maxResponse - minResponse;
        const throughput = parseFloat(match[4]);

        // Determine performance status
        let performanceStatus = 'Good';
        let statusColor = '#4CAF50';
        if (errorRate > 50) {
          performanceStatus = 'Critical';
          statusColor = '#F44336';
        } else if (errorRate > 10) {
          performanceStatus = 'Warning';
          statusColor = '#FF9800';
        } else if (avgResponse > 1000) {
          performanceStatus = 'Slow';
          statusColor = '#FFC107';
        }

        summaryData.push({
          type: match[1] === '+' ? 'Increment' : match[1] === '=' ? 'Total' : 'Summary',
          requests: requests,
          duration: match[3],
          rate: throughput,
          avgResponse: avgResponse,
          minResponse: minResponse,
          maxResponse: maxResponse,
          responseTimeRange: responseTimeRange,
          errors: errors,
          errorRate: errorRate,
          successRate: successRate,
          active: match[10] ? parseInt(match[10]) : null,
          started: match[11] ? parseInt(match[11]) : null,
          finished: match[12] ? parseInt(match[12]) : null,
          performanceStatus: performanceStatus,
          statusColor: statusColor
        });
      }
    }
  });

  return summaryData;
}

// Component for displaying test results charts
const TestResultsCharts = ({ summaryData }) => {
  const [activeTab, setActiveTab] = useState(0);

  if (!summaryData || summaryData.length === 0) return null;

  const totalRow = summaryData.find(row => row.type === 'Total');
  const incrementRows = summaryData.filter(row => row.type === 'Increment');

  // Success vs Error Rate Pie Chart
  const successErrorData = {
    labels: ['Successful Requests', 'Failed Requests'],
    datasets: [{
      data: [totalRow.successRate, totalRow.errorRate],
      backgroundColor: ['#4CAF50', '#F44336'],
      borderColor: ['#45a049', '#d32f2f'],
      borderWidth: 2,
    }]
  };

  // Response Time Distribution
  const responseTimeData = {
    labels: ['Min', 'Average', 'Max'],
    datasets: [{
      label: 'Response Time (ms)',
      data: [totalRow.minResponse, totalRow.avgResponse, totalRow.maxResponse],
      backgroundColor: ['#2196F3', '#FF9800', '#F44336'],
      borderColor: ['#1976D2', '#F57C00', '#D32F2F'],
      borderWidth: 2,
    }]
  };

  // Throughput Over Time (if increment data available)
  const throughputData = {
    labels: incrementRows.map((_, index) => `Phase ${index + 1}`),
    datasets: [{
      label: 'Throughput (req/s)',
      data: incrementRows.map(row => row.rate),
      borderColor: '#FF6D00',
      backgroundColor: 'rgba(255, 109, 0, 0.1)',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
    }]
  };

  // Performance Metrics Radar Chart
  const performanceMetrics = {
    labels: ['Success Rate', 'Response Time', 'Throughput', 'Error Rate', 'Stability'],
    datasets: [{
      label: 'Performance Score',
      data: [
        totalRow.successRate,
        Math.max(0, 100 - (totalRow.avgResponse / 10)), // Inverse of response time
        Math.min(100, totalRow.rate * 2), // Throughput score
        Math.max(0, 100 - totalRow.errorRate), // Inverse of error rate
        Math.max(0, 100 - (totalRow.responseTimeRange / totalRow.avgResponse * 50)) // Stability score
      ],
      backgroundColor: 'rgba(255, 109, 0, 0.2)',
      borderColor: '#FF6D00',
      borderWidth: 2,
      pointBackgroundColor: '#FF6D00',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#FF6D00'
    }]
  };

  // Error Distribution (if multiple phases)
  const errorDistributionData = {
    labels: incrementRows.map((_, index) => `Phase ${index + 1}`),
    datasets: [{
      label: 'Errors',
      data: incrementRows.map(row => row.errors),
      backgroundColor: '#F44336',
      borderColor: '#D32F2F',
      borderWidth: 1,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: 'Poppins, sans-serif',
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          family: 'Poppins, sans-serif',
          size: 14
        },
        bodyFont: {
          family: 'Poppins, sans-serif',
          size: 12
        }
      }
    }
  };

  const lineChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <Typography variant="h6" style={{ marginBottom: '16px', color: '#FF6D00', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <FaChartPie /> Performance Analytics Dashboard
      </Typography>

      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        sx={{
          '& .MuiTab-root': {
            color: '#666',
            fontWeight: 600,
            textTransform: 'none',
            minWidth: 'auto',
            padding: '8px 16px',
          },
          '& .Mui-selected': {
            color: '#FF6D00',
          },
          '& .MuiTabs-indicator': {
            backgroundColor: '#FF6D00',
          }
        }}
      >
        <Tab label="Overview" />
        <Tab label="Response Times" />
        <Tab label="Throughput Analysis" />
        <Tab label="Error Analysis" />
        <Tab label="Performance Metrics" />
      </Tabs>

      <div style={{ marginTop: '20px' }}>
        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} style={{ padding: '20px', borderRadius: '12px' }}>
                <Typography variant="h6" style={{ marginBottom: '16px', color: '#FF6D00' }}>
                  Success vs Error Rate
                </Typography>
                <div style={{ height: '300px', position: 'relative' }}>
                  <Doughnut
                    data={successErrorData}
                    options={{
                      ...chartOptions,
                      plugins: {
                        ...chartOptions.plugins,
                        legend: {
                          position: 'bottom'
                        }
                      }
                    }}
                  />
                </div>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} style={{ padding: '20px', borderRadius: '12px' }}>
                <Typography variant="h6" style={{ marginBottom: '16px', color: '#FF6D00' }}>
                  Response Time Distribution
                </Typography>
                <div style={{ height: '300px', position: 'relative' }}>
                  <Bar data={responseTimeData} options={lineChartOptions} />
                </div>
              </Paper>
            </Grid>
          </Grid>
        )}

        {activeTab === 1 && (
          <Paper elevation={2} style={{ padding: '20px', borderRadius: '12px' }}>
            <Typography variant="h6" style={{ marginBottom: '16px', color: '#FF6D00' }}>
              Response Time Analysis
            </Typography>
            <div style={{ height: '400px', position: 'relative' }}>
              <Line
                data={{
                  labels: incrementRows.map((_, index) => `Phase ${index + 1}`),
                  datasets: [
                    {
                      label: 'Average Response Time (ms)',
                      data: incrementRows.map(row => row.avgResponse),
                      borderColor: '#FF9800',
                      backgroundColor: 'rgba(255, 152, 0, 0.1)',
                      borderWidth: 3,
                      fill: false,
                      tension: 0.4,
                    },
                    {
                      label: 'Min Response Time (ms)',
                      data: incrementRows.map(row => row.minResponse),
                      borderColor: '#4CAF50',
                      backgroundColor: 'rgba(76, 175, 80, 0.1)',
                      borderWidth: 2,
                      fill: false,
                      tension: 0.4,
                    },
                    {
                      label: 'Max Response Time (ms)',
                      data: incrementRows.map(row => row.maxResponse),
                      borderColor: '#F44336',
                      backgroundColor: 'rgba(244, 67, 54, 0.1)',
                      borderWidth: 2,
                      fill: false,
                      tension: 0.4,
                    }
                  ]
                }}
                options={lineChartOptions}
              />
            </div>
          </Paper>
        )}

        {activeTab === 2 && (
          <Paper elevation={2} style={{ padding: '20px', borderRadius: '12px' }}>
            <Typography variant="h6" style={{ marginBottom: '16px', color: '#FF6D00' }}>
              Throughput Analysis Over Time
            </Typography>
            <div style={{ height: '400px', position: 'relative' }}>
              <Line data={throughputData} options={lineChartOptions} />
            </div>
          </Paper>
        )}

        {activeTab === 3 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} style={{ padding: '20px', borderRadius: '12px' }}>
                <Typography variant="h6" style={{ marginBottom: '16px', color: '#FF6D00' }}>
                  Error Distribution by Phase
                </Typography>
                <div style={{ height: '300px', position: 'relative' }}>
                  <Bar data={errorDistributionData} options={lineChartOptions} />
                </div>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} style={{ padding: '20px', borderRadius: '12px' }}>
                <Typography variant="h6" style={{ marginBottom: '16px', color: '#FF6D00' }}>
                  Error Rate Trend
                </Typography>
                <div style={{ height: '300px', position: 'relative' }}>
                  <Line
                    data={{
                      labels: incrementRows.map((_, index) => `Phase ${index + 1}`),
                      datasets: [{
                        label: 'Error Rate (%)',
                        data: incrementRows.map(row => row.errorRate),
                        borderColor: '#F44336',
                        backgroundColor: 'rgba(244, 67, 54, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                      }]
                    }}
                    options={lineChartOptions}
                  />
                </div>
              </Paper>
            </Grid>
          </Grid>
        )}

        {activeTab === 4 && (
          <Paper elevation={2} style={{ padding: '20px', borderRadius: '12px' }}>
            <Typography variant="h6" style={{ marginBottom: '16px', color: '#FF6D00' }}>
              Overall Performance Metrics
            </Typography>
            <div style={{ height: '400px', position: 'relative' }}>
              <Line
                data={performanceMetrics}
                options={{
                  ...chartOptions,
                  scales: {
                    r: {
                      beginAtZero: true,
                      max: 100,
                      grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                      },
                      pointLabels: {
                        font: {
                          family: 'Poppins, sans-serif',
                          size: 12
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </Paper>
        )}
      </div>
    </div>
  );
};

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

  const [jmxParams, setJmxParams] = useState(null); // extracted params
  const [editedParams, setEditedParams] = useState(null); // user input
  const [isParamsLoading, setIsParamsLoading] = useState(false);


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

  useEffect(() => {
    const fetchParams = async () => {
      if (!selectedFilename) {
        setJmxParams(null);
        return;
      }

      try {
        setIsParamsLoading(true);
        const res = await axiosInstance.get(`/extract-params?file=${encodeURIComponent(selectedFilename)}`);
        const data = res.data?.params;
        setJmxParams(data || null);
        setEditedParams({
          num_threads: data?.thread_groups?.[0]?.num_threads || "",
          ramp_time: data?.thread_groups?.[0]?.ramp_time || "",
          loop_count: data?.thread_groups?.[0]?.loop_count || ""
        });
      } catch (error) {
        console.error("Failed to extract JMX params:", error);
        setJmxParams(null);
      } finally {
        setIsParamsLoading(false);
      }
    };

    fetchParams();
  }, [selectedFilename]);

  const handleRunTest = async () => {
    if (!selectedFilename) {
      alert("Please select a JMX file to run the test");
      return;
    }

    setSummaryOutput("");
    setIsLoading(true);
    setStatusMessage(<span><FaClock /> Running test...</span>);
    setResultFile(null);
    setIsResultReady(false);

    try {
      const res = await axiosInstance.post(
        `/run-test/${encodeURIComponent(selectedFilename)}`,
        editedParams || {},
        { headers: { "Content-Type": "application/json" } }
      );

      const data = res.data;
      if (data.status === "success" || data.message?.includes("started in background")) {
        setStatusMessage(<span><FaCheckCircle color="green" /> {data.message}</span>);
        const filename = data.result_file;
        setResultFile(filename);
        setSummaryOutput(data.summary_output);

        const interval = setInterval(async () => {
          try {
            await axiosInstance.head(`/download/${filename}`);
            clearInterval(interval);
            setIsResultReady(true);
            setStatusMessage(<span><FaCheckCircle color="green" /> Test completed. Result is ready to download.</span>);

            const now = formatDateSafe(new Date());
            const newEntry = { filename, date: now };
            setHistory((prev) => {
              const updated = [newEntry, ...prev.filter((item) => item.filename !== filename)];
              localStorage.setItem("runTestHistory", JSON.stringify(updated));
              return updated;
            });
          } catch { }
        }, 3000);
      } else {
        setStatusMessage(<span><FaTimesCircle color="red" /> Error: {data.message}</span>);
      }
    } catch (err) {
      console.error("Run error:", err);
      setStatusMessage(<span><FaTimesCircle color="red" /> Network Error: {err.message}</span>);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (filename) => {
    try {
      const res = await axiosInstance.get(`/download/${filename}`);

      if (res.data.status === "success" && res.data.download_url) {
        const url = res.data.download_url;
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
        .tp-history-list:after {
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
            Run KickLoad Test
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

            {jmxParams && (
              <div style={{ marginBottom: '24px', width: '100%' }}>
                <Typography variant="subtitle1" style={{ fontWeight: 600, color: '#FF6D00', marginBottom: '8px' }}>
                  Configure Test Parameters
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Number of Users"
                      type="number"
                      fullWidth
                      value={editedParams?.num_threads || ""}
                      onChange={(e) => setEditedParams({ ...editedParams, num_threads: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Ramp-Up Time (s)"
                      type="number"
                      fullWidth
                      value={editedParams?.ramp_time || ""}
                      onChange={(e) => setEditedParams({ ...editedParams, ramp_time: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Loop Count"
                      type="number"
                      fullWidth
                      value={editedParams?.loop_count || ""}
                      onChange={(e) => setEditedParams({ ...editedParams, loop_count: e.target.value })}
                    />
                  </Grid>
                </Grid>
              </div>
            )}


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
                onClick={() => handleDownload(resultFile)}
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
                maxHeight: '300px',
                overflowY: 'auto',
                whiteSpace: 'normal',
              }}>
                <Typography variant="h6" style={{ marginBottom: '12px', color: '#FF6D00' }}>
                  Test Summary
                </Typography>
                {(parseSummaryOutput(summaryOutput).length > 0) ? (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'inherit', fontSize: 14 }}>
                      <thead>
                        <tr style={{ background: 'linear-gradient(135deg, #FF6D00, #FF8A3D)', color: 'white' }}>
                          <th style={{ padding: '8px 6px', border: '1px solid #E0E0E0', textAlign: 'center' }}>Type</th>
                          <th style={{ padding: '8px 6px', border: '1px solid #E0E0E0', textAlign: 'center' }}>Requests</th>
                          <th style={{ padding: '8px 6px', border: '1px solid #E0E0E0', textAlign: 'center' }}>Duration</th>
                          <th style={{ padding: '8px 6px', border: '1px solid #E0E0E0', textAlign: 'center' }}>Throughput<br />(req/s)</th>
                          <th style={{ padding: '8px 6px', border: '1px solid #E0E0E0', textAlign: 'center' }}>Response Time (ms)</th>
                          <th style={{ padding: '8px 6px', border: '1px solid #E0E0E0', textAlign: 'center' }}>Success Rate</th>
                          <th style={{ padding: '8px 6px', border: '1px solid #E0E0E0', textAlign: 'center' }}>Performance</th>
                          <th style={{ padding: '8px 6px', border: '1px solid #E0E0E0', textAlign: 'center' }}>Thread Status</th>
                        </tr>
                        <tr style={{ background: '#FFF3E0', color: '#666', fontSize: 12 }}>
                          <th style={{ padding: '4px 6px', border: '1px solid #E0E0E0', textAlign: 'center', fontWeight: 'normal' }}></th>
                          <th style={{ padding: '4px 6px', border: '1px solid #E0E0E0', textAlign: 'center', fontWeight: 'normal' }}>Total</th>
                          <th style={{ padding: '4px 6px', border: '1px solid #E0E0E0', textAlign: 'center', fontWeight: 'normal' }}>HH:MM:SS</th>
                          <th style={{ padding: '4px 6px', border: '1px solid #E0E0E0', textAlign: 'center', fontWeight: 'normal' }}>Requests/sec</th>
                          <th style={{ padding: '4px 6px', border: '1px solid #E0E0E0', textAlign: 'center', fontWeight: 'normal' }}>Avg | Min | Max</th>
                          <th style={{ padding: '4px 6px', border: '1px solid #E0E0E0', textAlign: 'center', fontWeight: 'normal' }}>Success %</th>
                          <th style={{ padding: '4px 6px', border: '1px solid #E0E0E0', textAlign: 'center', fontWeight: 'normal' }}>Status</th>
                          <th style={{ padding: '4px 6px', border: '1px solid #E0E0E0', textAlign: 'center', fontWeight: 'normal' }}>Active | Started | Finished</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parseSummaryOutput(summaryOutput).map((row, idx) => (
                          <tr key={idx} style={{
                            background: idx % 2 === 0 ? '#FFF8F1' : '#FFFFFF',
                            transition: 'all 0.2s ease'
                          }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#FFE0B2';
                              e.currentTarget.style.transform = 'scale(1.01)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = idx % 2 === 0 ? '#FFF8F1' : '#FFFFFF';
                              e.currentTarget.style.transform = 'scale(1)';
                            }}>
                            <td style={{
                              padding: '8px 6px',
                              border: '1px solid #E0E0E0',
                              fontWeight: 600,
                              textAlign: 'center',
                              background: row.type === 'Total' ? '#FFE0B2' : 'transparent'
                            }}>
                              {row.type}
                            </td>
                            <td style={{
                              padding: '8px 6px',
                              border: '1px solid #E0E0E0',
                              textAlign: 'center',
                              fontWeight: 600,
                              color: row.type === 'Total' ? '#FF6D00' : '#333'
                            }}>
                              {row.requests.toLocaleString()}
                            </td>
                            <td style={{
                              padding: '8px 6px',
                              border: '1px solid #E0E0E0',
                              textAlign: 'center',
                              fontFamily: 'monospace',
                              fontSize: 13
                            }}>
                              {row.duration}
                            </td>
                            <td style={{
                              padding: '8px 6px',
                              border: '1px solid #E0E0E0',
                              textAlign: 'center',
                              fontWeight: 600,
                              color: row.rate > 100 ? '#4CAF50' : row.rate > 50 ? '#FF9800' : '#F44336'
                            }}>
                              {row.rate.toFixed(1)}
                            </td>
                            <td style={{
                              padding: '8px 6px',
                              border: '1px solid #E0E0E0',
                              textAlign: 'center',
                              fontFamily: 'monospace',
                              fontSize: 12
                            }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{
                                  color: row.avgResponse > 1000 ? '#F44336' : row.avgResponse > 500 ? '#FF9800' : '#4CAF50',
                                  fontWeight: 600
                                }}>
                                  Avg: {row.avgResponse}ms
                                </span>
                                <span style={{ color: '#666', fontSize: 11 }}>
                                  Min: {row.minResponse}ms | Max: {row.maxResponse}ms
                                </span>
                                <span style={{ color: '#999', fontSize: 10 }}>
                                  Range: {row.responseTimeRange}ms
                                </span>
                              </div>
                            </td>
                            <td style={{
                              padding: '8px 6px',
                              border: '1px solid #E0E0E0',
                              textAlign: 'center'
                            }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{
                                  color: row.successRate > 95 ? '#4CAF50' : row.successRate > 80 ? '#FF9800' : '#F44336',
                                  fontWeight: 600
                                }}>
                                  {row.successRate.toFixed(1)}%
                                </span>
                                <span style={{ color: '#666', fontSize: 11 }}>
                                  Errors: {row.errors} ({row.errorRate.toFixed(1)}%)
                                </span>
                              </div>
                            </td>
                            <td style={{
                              padding: '8px 6px',
                              border: '1px solid #E0E0E0',
                              textAlign: 'center'
                            }}>
                              <span style={{
                                background: row.statusColor,
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '12px',
                                fontSize: 11,
                                fontWeight: 600,
                                display: 'inline-block',
                                minWidth: '60px'
                              }}>
                                {row.performanceStatus}
                              </span>
                            </td>
                            <td style={{
                              padding: '8px 6px',
                              border: '1px solid #E0E0E0',
                              textAlign: 'center',
                              fontFamily: 'monospace',
                              fontSize: 12
                            }}>
                              {row.active !== null ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                  <span style={{ color: '#4CAF50', fontWeight: 600 }}>
                                    Active: {row.active}
                                  </span>
                                  <span style={{ color: '#666', fontSize: 11 }}>
                                    Started: {row.started} | Finished: {row.finished}
                                  </span>
                                </div>
                              ) : (
                                <span style={{ color: '#999' }}>-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Summary Statistics */}
                    <div style={{
                      marginTop: '16px',
                      padding: '12px',
                      background: 'linear-gradient(135deg, #FFF3E0, #FFE0B2)',
                      borderRadius: '8px',
                      border: '1px solid #FFCC80'
                    }}>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '12px',
                        fontSize: 13
                      }}>
                        {(() => {
                          const totalRow = parseSummaryOutput(summaryOutput).find(row => row.type === 'Total');
                          const incrementRows = parseSummaryOutput(summaryOutput).filter(row => row.type === 'Increment');

                          if (totalRow) {
                            // Calculate additional metrics
                            const avgThroughput = incrementRows.length > 0
                              ? incrementRows.reduce((sum, row) => sum + row.rate, 0) / incrementRows.length
                              : totalRow.rate;

                            const responseTimeStability = totalRow.responseTimeRange / totalRow.avgResponse * 100;

                            return (
                              <>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <span style={{ fontWeight: 600, color: '#FF6D00' }}>Total Requests:</span>
                                  <span style={{ fontWeight: 600 }}>{totalRow.requests.toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <span style={{ fontWeight: 600, color: '#FF6D00' }}>Overall Success Rate:</span>
                                  <span style={{
                                    fontWeight: 600,
                                    color: totalRow.successRate > 95 ? '#4CAF50' : totalRow.successRate > 80 ? '#FF9800' : '#F44336'
                                  }}>
                                    {totalRow.successRate.toFixed(1)}%
                                  </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <span style={{ fontWeight: 600, color: '#FF6D00' }}>Average Response Time:</span>
                                  <span style={{
                                    fontWeight: 600,
                                    color: totalRow.avgResponse > 1000 ? '#F44336' : totalRow.avgResponse > 500 ? '#FF9800' : '#4CAF50'
                                  }}>
                                    {totalRow.avgResponse}ms
                                  </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <span style={{ fontWeight: 600, color: '#FF6D00' }}>Peak Throughput:</span>
                                  <span style={{ fontWeight: 600 }}>{totalRow.rate.toFixed(1)} req/s</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <span style={{ fontWeight: 600, color: '#FF6D00' }}>Avg Throughput:</span>
                                  <span style={{ fontWeight: 600 }}>{avgThroughput.toFixed(1)} req/s</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <span style={{ fontWeight: 600, color: '#FF6D00' }}>Response Time Range:</span>
                                  <span style={{
                                    fontWeight: 600,
                                    color: responseTimeStability > 200 ? '#F44336' : responseTimeStability > 100 ? '#FF9800' : '#4CAF50'
                                  }}>
                                    {totalRow.responseTimeRange}ms
                                  </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <span style={{ fontWeight: 600, color: '#FF6D00' }}>Total Errors:</span>
                                  <span style={{
                                    fontWeight: 600,
                                    color: totalRow.errors > 0 ? '#F44336' : '#4CAF50'
                                  }}>
                                    {totalRow.errors.toLocaleString()}
                                  </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <span style={{ fontWeight: 600, color: '#FF6D00' }}>Test Phases:</span>
                                  <span style={{ fontWeight: 600 }}>{incrementRows.length + 1}</span>
                                </div>
                              </>
                            );
                          }
                          return null;
                        })()}
                      </div>

                      {/* Performance Insights */}
                      {(() => {
                        const totalRow = parseSummaryOutput(summaryOutput).find(row => row.type === 'Total');
                        if (totalRow) {
                          const insights = [];

                          if (totalRow.successRate < 95) {
                            insights.push('⚠️ High error rate detected - consider investigating server issues');
                          }
                          if (totalRow.avgResponse > 1000) {
                            insights.push('🐌 Slow response times - performance optimization recommended');
                          }
                          if (totalRow.responseTimeRange > totalRow.avgResponse * 2) {
                            insights.push('📊 High response time variance - inconsistent performance');
                          }
                          if (totalRow.rate < 10) {
                            insights.push('📉 Low throughput - consider increasing load or optimizing');
                          }
                          if (insights.length === 0) {
                            insights.push('✅ Good performance across all metrics');
                          }

                          return (
                            <div style={{
                              marginTop: '12px',
                              padding: '8px 12px',
                              background: 'rgba(255, 255, 255, 0.7)',
                              borderRadius: '6px',
                              borderLeft: '4px solid #FF6D00'
                            }}>
                              <div style={{ fontWeight: 600, color: '#FF6D00', marginBottom: '4px' }}>
                                Performance Insights:
                              </div>
                              {insights.map((insight, idx) => (
                                <div key={idx} style={{ fontSize: 12, color: '#666', marginBottom: '2px' }}>
                                  {insight}
                                </div>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                ) : (
                  <pre style={{ margin: 0 }}>{summaryOutput}</pre>
                )}

                {/* Professional Charts and Analytics */}
                {(parseSummaryOutput(summaryOutput).length > 0) && (
                  <TestResultsCharts summaryData={parseSummaryOutput(summaryOutput)} />
                )}
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