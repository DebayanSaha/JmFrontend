import React, { createContext, useContext, useEffect, useState } from "react";
import { checkAuthentication, getCurrentUser } from "../components/VerifiedPopup";

const AuthContext = createContext();

let externalUpdateAuth = null;

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(checkAuthentication());
  const [user, setUser] = useState(getCurrentUser());

    const updateAuth = () => {
      setIsAuthenticated(checkAuthentication());
      setUser(getCurrentUser());
    };
  useEffect(() => {
    externalUpdateAuth = updateAuth;
    window.addEventListener("storage", updateAuth);
    window.addEventListener("local-storage-changed", updateAuth);
    return () => {
      window.removeEventListener("storage", updateAuth);
      window.removeEventListener("local-storage-changed", updateAuth);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, setIsAuthenticated, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}

export function updateAuth() {
  if (externalUpdateAuth) {
    externalUpdateAuth();
  }
} 