import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSelector } from "react-redux";

import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./components/layout/DashboardLayout";
import FolderLayout from "./components/layout/FolderLayout";
import UserManagementTable from "./components/users/UserManagementTable";
import TeamList from "./components/teams/TeamList";
import { Paper, Typography } from "@mui/material";
import type { RootState } from "./store/index.ts";
import SnackbarNotifier from "./common/SnackbarNotifier.tsx";
import NoteLayout from "./components/layout/NoteLayout.tsx";
import TeamAssetsView from "./components/teams/TeamAssetsView.tsx";
import UserAssetsView from "./components/users/UserAssetsView.tsx";
import FolderPage from "./pages/FolderPage.tsx";

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

const MySharedFoldersOverviewPage: React.FC = () => {
  return (
    <Paper sx={{ p: 3, borderRadius: "12px", boxShadow: 1, mt: 2 }}>
      <Typography variant="h5">My Shared Folders Overview</Typography>
      <Typography sx={{ mt: 2 }}>
        Select a shared folder from the sidebar to view its content, or
        collaborate with others.
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
          <Route path=":folderId" element={<FolderPage />} />
        </Route>

        <Route
          path="/shared-folders"
          element={<AuthenticatedRouteWrapper LayoutComponent={FolderLayout} />}
        >
          <Route index element={<MySharedFoldersOverviewPage />} />
          <Route path=":folderId" element={<FolderPage />} />
        </Route>

        <Route
          path="folders/:folderId/notes/:noteId"
          element={<NoteLayout />}
        ></Route>

        <Route
          path="shared-folders/:folderId/notes/:noteId"
          element={<NoteLayout />}
        ></Route>

        <Route path="/teams/:teamId/assets" element={<TeamAssetsView />} />

        <Route path="/users/:userId/assets" element={<UserAssetsView />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
