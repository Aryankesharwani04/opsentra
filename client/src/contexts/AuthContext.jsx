// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import { api } from "../utils/api";

export const AuthContext = createContext({
  user: null,
  login: () => Promise.resolve(),
  logout: () => {},
  authLoading: true,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // on mount, see if we already have a token and load the profile
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api("/api/auth/me", { token })
        .then(profile => setUser(profile))
        .catch(() => {
          localStorage.removeItem("token");
          setUser(null);
        })
        .finally(() => setAuthLoading(false));
    } else {
      // no token → we know immediately that we're not authed
      setAuthLoading(false);
    }
  }, []);

  // login: store token, fetch profile, set user, then reload
  const login = (token) => {
    localStorage.setItem("token", token);
    return api("/api/auth/me", { token })
      .then(profile => {
        setUser(profile);
        // now that user is set, reload the page so all consumers update
        window.location.reload();
      })
      .catch(err => {
        // on error, clean up
        localStorage.removeItem("token");
        throw err;
      });
  };

  // logout: clear token, clear user, then reload
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    // reload so Navbar and routes see user===null
    window.location.reload();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
