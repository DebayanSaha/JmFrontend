import React, { useState, useEffect } from "react";
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

  // You may want to get license, isAuthenticated, handleLogout, handleUpgrade from context or props
  // For now, pass dummy/placeholder or lift state up as needed

  const sidebarWidth = isMobile ? "100%" : "260px";

  // Dummy handlers for dropdown actions (replace with real ones as needed)
  const license = undefined; // get from context or props if needed
  const isAuthenticated = undefined; // get from context or props if needed
  const handleLogout = () => { window.location.href = '/login'; };
  const handleUpgrade = () => { navigate('/payment'); };

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      flexDirection: 'column',
      position: 'relative',
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden'
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
      {/* Settings Dropdown rendered at the end of the DOM tree for priority */}
      {ReactDOM.createPortal(
        <SettingsDropdown 
          open={dropdownOpen} 
          onClose={() => setDropdownOpen(false)}
          navigate={navigate}
          license={undefined}
          isAuthenticated={true}
          handleLogout={onLogout}
          handleUpgrade={() => navigate('/payment')}
        />,
        document.body
      )}
      <div style={{ 
        display: 'flex', 
        flexGrow: 1,
        position: 'relative',
        width: '100%',
        maxWidth: '100%',
        overflowX: 'hidden'
      }}>
        <Sidebar 
          isMobile={isMobile}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
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
              zIndex: 1198,
              transition: 'opacity 0.3s ease'
            }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <div 
          style={{ 
            marginLeft: isMobile ? '0' : sidebarWidth, 
            paddingTop: '40px',
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            width: isMobile ? '100%' : `calc(100% - ${sidebarWidth})`,
            maxWidth: '100%',
            boxSizing: 'border-box',
            transition: 'margin-left 0.3s ease, width 0.3s ease',
            overflowX: 'hidden'
          }}
        >
          <main style={{ 
            flexGrow: 1, 
            padding: "0px", 
            background: 'linear-gradient(to bottom, #FFF8F1, #FFF1E6)',
            minHeight: 'calc(100vh - 80px)',
            width: '100%',
            maxWidth: '100%',
            overflowX: 'hidden'
          }}>
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
      
      <style>{`
        /* Responsive Layout Adjustments */
        @media (max-width: var(--breakpoint-xl)) {
          main {
            max-width: 100vw !important;
            overflow-x: hidden !important;
          }
        }
        
        @media (max-width: var(--breakpoint-lg)) {
          main {
            max-width: 100vw !important;
            overflow-x: hidden !important;
          }
        }
        
        @media (max-width: var(--breakpoint-md)) {
          main {
            max-width: 100vw !important;
            overflow-x: hidden !important;
          }
        }
        
        @media (max-width: var(--breakpoint-sm)) {
          main {
            max-width: 100vw !important;
            overflow-x: hidden !important;
            padding: 0 !important;
          }
        }
        
        @media (max-width: 480px) {
          main {
            max-width: 100vw !important;
            overflow-x: hidden !important;
            padding: 0 !important;
          }
        }
        
        @media (max-width: 360px) {
          main {
            max-width: 100vw !important;
            overflow-x: hidden !important;
            padding: 0 !important;
          }
        }
        
        /* Global responsive utilities */
        @media (max-width: var(--breakpoint-md)) {
          .tp-main, .enhanced-bg, .tp-root {
            max-width: 100vw !important;
            overflow-x: hidden !important;
            padding-left: clamp(8px, 2vw, 16px) !important;
            padding-right: clamp(8px, 2vw, 16px) !important;
          }
        }
        
        @media (max-width: var(--breakpoint-sm)) {
          .tp-main, .enhanced-bg, .tp-root {
            max-width: 100vw !important;
            overflow-x: hidden !important;
            padding-left: clamp(4px, 2vw, 12px) !important;
            padding-right: clamp(4px, 2vw, 12px) !important;
          }
        }
        
        @media (max-width: 480px) {
          .tp-main, .enhanced-bg, .tp-root {
            max-width: 100vw !important;
            overflow-x: hidden !important;
            padding-left: clamp(2px, 2vw, 8px) !important;
            padding-right: clamp(2px, 2vw, 8px) !important;
          }
        }
        
        @media (max-width: 360px) {
          .tp-main, .enhanced-bg, .tp-root {
            max-width: 100vw !important;
            overflow-x: hidden !important;
            padding-left: clamp(1px, 2vw, 4px) !important;
            padding-right: clamp(1px, 2vw, 4px) !important;
          }
        }
      `}</style>
    </div>
  );
}

export default Layout;
