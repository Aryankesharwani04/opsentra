// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import { api } from "../utils/api";


export const AuthContext = createContext({
  user: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // on mount, see if we already have a token and load the profile
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api("/api/auth/me", { token })
        .then(profile => setUser(profile))
        .catch(() => {
          localStorage.removeItem("token");
          setUser(null);
        });
    }
  }, []);

  const login = (token) => {
    localStorage.setItem("token", token);
    // fetch & set profile
    api("/api/auth/me", { token }).then(profile => setUser(profile));
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
