import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

export default function PrivateRoute() {
  const { user, authLoading } = useContext(AuthContext);

  if (authLoading) {
    // still checking token → show spinner or placeholder
    return <div className="text-center py-10">Loading…</div>;
  }

  // if no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
