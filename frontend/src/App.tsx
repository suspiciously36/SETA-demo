// src/App.tsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom"; // Added Outlet
import { useSelector } from "react-redux";
import { RootState } from "./store";

import LoginPage from "./pages/LoginPage";
import MainLayout from "./components/layout/MainLayout";
import UserManagementTable from "./components/users/UserManagementTable"; // For direct routing if needed
import TeamList from "./components/teams/TeamList"; // For direct routing if needed

interface ProtectedRouteProps {
  children?: React.ReactNode; // children is optional if using Outlet
}

const ProtectedLayout: React.FC<ProtectedRouteProps> = () => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  // MainLayout will now contain the Outlet for nested routes
  return <MainLayout />;
};

const App: React.FC = () => {
  return (
    <Router>
      <SnackbarNotifier />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes will render inside MainLayout's Outlet */}
        <Route path="/" element={<ProtectedLayout />}>
          {/* Default authenticated route */}
          <Route index element={<Navigate to="/users" replace />} />
          <Route path="users" element={<UserManagementTable />} />
          <Route path="teams" element={<TeamList />} />
          <Route
            path="managers"
            element={
              <Paper
                sx={{
                  width: "100%",
                  overflow: "hidden",
                  borderRadius: "12px",
                  boxShadow: 3,
                  p: 3,
                }}
              >
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Manager View Placeholder
                </Typography>
                <Typography>
                  {" "}
                  Content for managing managers will go here.{" "}
                </Typography>
              </Paper>
            }
          />

          {/* Add other nested routes for Checklist, Notification, Profile, Setting here */}
          {/* Example: <Route path="profile" element={<ProfilePage />} /> */}
        </Route>

        {/* Fallback for any other path if not authenticated */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};
// Temporary Paper and Typography import for the placeholder, move to actual component later
import { Paper, Typography } from "@mui/material";
import SnackbarNotifier from "./common/SnackbarNotifier.tsx";

export default App;
