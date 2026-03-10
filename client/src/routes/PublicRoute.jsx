
import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

export default function PublicRoute() {
  const { user, authLoading } = useContext(AuthContext);

  if (authLoading) {
    return <div className="text-center py-10">Loading…</div>;
  }

  // if already logged in, bounce to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // otherwise render the public children
  return <Outlet />;
}
