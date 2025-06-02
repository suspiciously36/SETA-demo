// src/App.tsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom"; // Ensure Outlet is imported
import { useSelector } from "react-redux";

import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./components/layout/DashboardLayout"; // Your main dashboard layout
import FolderLayout from "./components/layout/FolderLayout"; // Your new folder layout
import UserManagementTable from "./components/users/UserManagementTable";
import TeamList from "./components/teams/TeamList";
// Placeholders for folder content - create these as actual components
import { Paper, Typography } from "@mui/material";
import { useParams } from "react-router-dom"; // For FolderContentView placeholder
import type { RootState } from "./store/index.ts";
import SnackbarNotifier from "./common/SnackbarNotifier.tsx";
import NoteLayout from "./components/layout/NoteLayout.tsx";
import MyFolderPage from "./pages/MyFolderPage.tsx";

const FolderContentView: React.FC = () => {
  const { folderId } = useParams<{ folderId: string }>();
  // In a real app, you'd fetch notes for this folderId here
  return (
    <Paper sx={{ p: 3, borderRadius: "12px", boxShadow: 1, mt: 2 }}>
      <Typography variant="h5">Folder: {folderId}</Typography>
      <Typography sx={{ mt: 2 }}>
        Content of the folder (e.g., notes list) will appear here.
      </Typography>
    </Paper>
  );
};

const MyFoldersOverviewPage: React.FC = () => {
  return (
    <Paper sx={{ p: 3, borderRadius: "12px", boxShadow: 1, mt: 2 }}>
      <Typography variant="h5">My Folders Overview</Typography>
      <Typography sx={{ mt: 2 }}>
        Select a folder from the sidebar to view its content, or create a new
        folder using the '+' button in the sidebar.
      </Typography>
    </Paper>
  );
};

interface AuthenticatedRouteWrapperProps {
  LayoutComponent: React.ElementType;
}

const AuthenticatedRouteWrapper: React.FC<AuthenticatedRouteWrapperProps> = ({
  LayoutComponent,
}) => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <LayoutComponent />;
};

const App: React.FC = () => {
  return (
    <Router>
      <SnackbarNotifier />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <AuthenticatedRouteWrapper LayoutComponent={DashboardLayout} />
          }
        >
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
                  Manager Management
                </Typography>
                <Typography>
                  Content for managing managers will go here.
                </Typography>
              </Paper>
            }
          />
        </Route>

        <Route
          path="/folders"
          element={<AuthenticatedRouteWrapper LayoutComponent={FolderLayout} />}
        >
          <Route index element={<MyFoldersOverviewPage />} />
          <Route path=":folderId" element={<MyFolderPage />} />
        </Route>

        <Route path="folders/:folderId/notes/:noteId" element={<NoteLayout />}>
          {/* <Route index element={<YourNoteEditorComponent />} /> */}
          {/* Other nested routes related to a specific note if any */}
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
