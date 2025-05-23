// src/components/layout/Sidebar.tsx
import React, { useEffect } from "react"; // Added useEffect
import { Link as RouterLink, useLocation } from "react-router-dom"; // Import Link and useLocation
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Box,
  Collapse,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import ChecklistIcon from "@mui/icons-material/Checklist";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
// Removed PersonIcon, Person4Icon as we'll use PeopleIcon, SupervisorAccountIcon, GroupWorkIcon for clarity

const drawerWidth = 300; // Sidebar width from your code

// Define a type for the active view string that MainLayout will pass
type ActiveViewType =
  | "users"
  | "teams"
  | "managers"
  | "checklist"
  | "notifications"
  | "profile"
  | "settings"
  | string;

interface SidebarProps {
  activeView: ActiveViewType; // Prop to indicate current active section from MainLayout
}

const Sidebar: React.FC<SidebarProps> = ({ activeView }) => {
  const location = useLocation();

  // State for expandable "Dashboard" section in sidebar (which contains User/Manager/Team Management)
  const [managementSectionOpen, setManagementSectionOpen] =
    React.useState(true);

  // Automatically open the "Dashboard" section if a child route is active on load
  useEffect(() => {
    if (
      ["/users", "/managers", "/teams"].some((path) =>
        location.pathname.startsWith(path)
      )
    ) {
      setManagementSectionOpen(true);
    }
  }, [location.pathname]);

  const handleManagementSectionToggle = () => {
    setManagementSectionOpen(!managementSectionOpen);
  };

  const menuItems = [
    {
      text: "Dashboard",
      icon: <DashboardIcon />,
      onClick: handleManagementSectionToggle,
      open: managementSectionOpen,
      active: ["users", "managers", "teams"].includes(activeView),
      subItems: [
        {
          text: "User Management",
          icon: <PeopleIcon />,
          path: "/users",
          id: "users",
        },
        {
          text: "Manager Management",
          icon: <SupervisorAccountIcon />,
          path: "/managers",
          id: "managers",
        },
        {
          text: "Team Management",
          icon: <GroupWorkIcon />,
          path: "/teams",
          id: "teams",
        },
      ],
    },
    {
      text: "Checklist (not available)",
      icon: <ChecklistIcon />,
      path: "/checklist",
      id: "checklist",
    },
    {
      text: "Notification (not available)",
      icon: <NotificationsIcon />,
      path: "/notifications",
      id: "notifications",
    },
  ];

  const bottomMenuItems = [
    {
      text: "Profile (not available)",
      icon: <AccountCircleIcon />,
      path: "/profile",
      id: "profile",
    },
    {
      text: "Setting (not available)",
      icon: <SettingsIcon />,
      path: "/settings",
      id: "settings",
    },
  ];

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 2,
          backgroundColor: "primary.main",
          color: "white",
        }}
      >
        <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
          LOGO
        </Typography>
        <Typography variant="caption" sx={{ ml: 1, opacity: 0.8 }}>
          v1.0
        </Typography>
      </Toolbar>
      <List sx={{ flexGrow: 1, pt: 2 }}>
        {menuItems.map((item) => (
          <React.Fragment key={item.text}>
            <ListItemButton
              component={
                item.path && (!item.subItems || item.subItems.length === 0)
                  ? RouterLink
                  : "div"
              }
              to={item.path}
              selected={item.active || activeView === item.id}
              onClick={item.onClick}
              sx={{
                mx: 2,
                borderRadius: "8px",
                mb: 0.5,
                "&.Mui-selected": {
                  backgroundColor: "rgba(255, 255, 255, 0.16)",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                  },
                },
                "&:hover": {
                  backgroundColor:
                    item.active || activeView === item.id
                      ? "rgba(255, 255, 255, 0.2)"
                      : "rgba(255, 255, 255, 0.08)", // Lighter hover for non-active
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color:
                    item.active || activeView === item.id
                      ? "white"
                      : "rgba(255,255,255,0.7)",
                  minWidth: "40px",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight:
                    item.active || activeView === item.id ? "bold" : "normal",
                  color:
                    item.active || activeView === item.id
                      ? "white"
                      : "rgba(255,255,255,0.9)",
                }}
              />
              {item.subItems && item.subItems.length > 0 ? (
                item.open ? (
                  <ExpandLess
                    sx={{
                      color:
                        item.active || activeView === item.id
                          ? "white"
                          : "rgba(255,255,255,0.7)",
                    }}
                  />
                ) : (
                  <ExpandMore
                    sx={{
                      color:
                        item.active || activeView === item.id
                          ? "white"
                          : "rgba(255,255,255,0.7)",
                    }}
                  />
                )
              ) : null}
            </ListItemButton>
            {item.subItems && item.subItems.length > 0 && (
              <Collapse in={item.open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.subItems.map((subItem) => (
                    <ListItemButton
                      key={subItem.text}
                      component={RouterLink}
                      to={subItem.path}
                      selected={activeView === subItem.id} // Compare with activeView prop
                      sx={{
                        pl: 4, // Indent sub-items
                        mx: 2,
                        borderRadius: "8px",
                        mb: 0.5,
                        "&.Mui-selected": {
                          backgroundColor: "rgba(255, 255, 255, 0.22)",
                          "&:hover": {
                            backgroundColor: "rgba(255, 255, 255, 0.25)",
                          },
                        },
                        "&:hover": {
                          backgroundColor:
                            activeView === subItem.id
                              ? "rgba(255, 255, 255, 0.25)"
                              : "rgba(255, 255, 255, 0.08)",
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          color:
                            activeView === subItem.id
                              ? "white"
                              : "rgba(255,255,255,0.7)",
                          minWidth: "36px",
                        }}
                      >
                        {subItem.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={subItem.text}
                        primaryTypographyProps={{
                          fontWeight:
                            activeView === subItem.id ? "bold" : "normal",
                          color:
                            activeView === subItem.id
                              ? "white"
                              : "rgba(255,255,255,0.9)",
                        }}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>
      <Box>
        <List sx={{ pb: 2 }}>
          {bottomMenuItems.map((item) => (
            <ListItemButton
              key={item.text}
              component={RouterLink}
              to={item.path}
              selected={activeView === item.id}
              sx={{
                mx: 2,
                borderRadius: "8px",
                mb: 0.5,
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                },
                "&.Mui-selected": {
                  backgroundColor: "rgba(255, 255, 255, 0.16)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color:
                    activeView === item.id ? "white" : "rgba(255,255,255,0.7)",
                  minWidth: "40px",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  color:
                    activeView === item.id ? "white" : "rgba(255,255,255,0.9)",
                }}
              />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor: "#673ab7",
          color: "white",
          borderRight: "none",
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
