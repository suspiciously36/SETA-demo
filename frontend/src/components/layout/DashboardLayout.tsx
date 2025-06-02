import React, { useEffect, useState } from "react";
import {
  Box,
  Toolbar,
  Tabs,
  Tab,
  Paper,
  Typography,
  CssBaseline,
} from "@mui/material";
import Sidebar from "./Sidebar";
import TopBar from "./Topbar";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/index";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const drawerWidth = 260;

type ViewType = "users" | "teams" | "managers" | string;

const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeView, setActiveView] = useState<ViewType>("users");

  const userPagination = useSelector(
    (state: RootState) => state.userList.pagination
  );
  const teamPagination = useSelector(
    (state: RootState) => state.teams.pagination
  );

  const usersCount = userPagination?.totalRecords || "";
  const teamsCount = teamPagination?.totalRecords || "";
  const managerCountPlaceholder = 69;

  useEffect(() => {
    const pathSegments = location.pathname.split("/");
    const currentFirstSegment = pathSegments[1] || "users";

    if (["users", "teams", "managers"].includes(currentFirstSegment)) {
      setActiveView(currentFirstSegment as ViewType);
    } else {
      setActiveView("users");
    }
  }, [location.pathname]);

  const handleChangeView = (
    event: React.SyntheticEvent,
    newValue: ViewType
  ) => {
    navigate(`/${newValue}`);
  };

  const pageTitle = "Management Dashboard"; // Default title

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <CssBaseline />
      <Sidebar activeView={activeView} />
      <TopBar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: 0,
          px: 3,
          pb: 3,
          background:
            "linear-gradient(180deg, #fff 0%,rgb(166, 197, 240) 100%)",
          overflowY: "auto",
          color: "rgba(48, 112, 196, 1)",
        }}
      >
        <Toolbar />
        <Typography
          variant="h3"
          component="h1"
          sx={{ fontWeight: "500", my: 3, color: "#666" }}
        >
          {pageTitle}
        </Typography>
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            borderRadius: "12px",
            overflow: "hidden",
            backgroundColor: "background.paper",
            p: 0.5,
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <Tabs
            value={activeView}
            onChange={handleChangeView}
            indicatorColor="primary"
            textColor="primary"
            variant="standard"
            sx={{
              "& .MuiTabs-indicator": {
                height: "4px",
                borderRadius: "4px 4px 0 0",
              },
            }}
          >
            <Tab
              value="users"
              label={`User | ${usersCount}`}
              sx={{
                // color: "rgba(48, 112, 196, 0.95)",
                textTransform: "none",
                fontWeight: activeView === "users" ? "bold" : 500,
                fontSize: "0.95rem",
                px: 3,
                py: 1.5,
              }}
            />
            <Tab
              value="managers"
              label={`Manager | ${managerCountPlaceholder}`}
              sx={{
                textTransform: "none",
                fontWeight: activeView === "managers" ? "bold" : 500,
                fontSize: "0.95rem",
                px: 3,
                py: 1.5,
              }}
            />
            <Tab
              value="teams"
              label={`Team | ${teamsCount}`}
              sx={{
                textTransform: "none",
                fontWeight: activeView === "teams" ? "bold" : 500,
                fontSize: "0.95rem",
                px: 3,
                py: 1.5,
              }}
            />
          </Tabs>
        </Paper>
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout;
