import React, { useState } from "react";
import Header, { SettingsDropdown } from "./components/Header";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import { Outlet, useNavigate } from "react-router-dom";
import { useResponsive } from './useResponsive';
import ReactDOM from 'react-dom';

function Layout({ licenseStatus, onLogout }) {
  const { isSm, isXs } = useResponsive();
  const isMobile = isXs || isSm;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  // Sidebar width for desktop
  const sidebarWidth = 260;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      width: '100vw',
      maxWidth: '100vw',
      overflowX: 'hidden',
      position: 'relative',
    }}>
      <Header
        licenseStatus={licenseStatus}
        isMobile={isMobile}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        dropdownOpen={dropdownOpen}
        setDropdownOpen={setDropdownOpen}
        onLogout={onLogout}
      />
      {ReactDOM.createPortal(
        <SettingsDropdown
          open={dropdownOpen}
          onClose={() => setDropdownOpen(false)}
          navigate={navigate}
          license={licenseStatus}
          isAuthenticated={true}
          handleLogout={onLogout}
          handleUpgrade={() => navigate('/payment')}
        />,
        document.body
      )}
      {/* Main flex row: sidebar + content */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        flex: 1,
        width: '100vw',
        maxWidth: '100vw',
        minHeight: 'calc(100vh - 80px)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Sidebar: always present in flex context, overlays on mobile */}
        <div
          style={{
            width: isMobile ? 0 : sidebarWidth,
            minWidth: isMobile ? 0 : sidebarWidth,
            maxWidth: isMobile ? 0 : sidebarWidth,
            transition: 'width 0.3s',
            zIndex: isMobile ? 10000 : 1200,
            position: isMobile ? 'fixed' : 'relative',
            left: 0,
            top: isMobile ? 0 : 80,
            height: isMobile ? '100vh' : 'calc(100vh - 80px)',
            display: isMobile && !sidebarOpen ? 'none' : 'block',
          }}
        >
          <Sidebar
            isMobile={isMobile}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        </div>
        {/* Mobile overlay */}
        {isMobile && sidebarOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 9999,
              transition: 'opacity 0.3s ease',
            }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
        {/* Main content: always flex: 1, min-width: 0 for perfect wrapping */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            maxWidth: '100vw',
            boxSizing: 'border-box',
            overflowX: 'hidden',
            paddingTop: '40px',
            background: 'linear-gradient(to bottom, #FFF8F1, #FFF1E6)',
            transition: 'all 0.3s',
          }}
        >
          <main style={{
            flexGrow: 1,
            width: '100%',
            maxWidth: '100vw',
            minHeight: 'calc(100vh - 80px)',
            overflowX: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
      <style>{`
        @media (max-width: var(--breakpoint-md)) {
          .sidebar, aside {
            position: fixed !important;
            z-index: 1200 !important;
            overflow-x: hidden !important;
          }
        }
        @media (max-width: var(--breakpoint-sm)) {
          main {
            padding: 0 !important;
          }
        }
        @media (max-width: 480px) {
          main {
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}

export default Layout;
