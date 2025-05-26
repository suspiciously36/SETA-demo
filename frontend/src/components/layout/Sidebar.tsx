import React, { useEffect } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  Collapse,
  useTheme,
  Divider,
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
import LogoutIcon from "@mui/icons-material/Logout";

import { logoutUser } from "../../store/actions/authActions";
import { AppDispatch } from "../../store";

import appLogo from "../../assets/images/seta-removebg-preview.png";

const drawerWidth = 300;

type ActiveViewType =
  | "users"
  | "teams"
  | "managers"
  | "checklist"
  | "notifications"
  | "profile"
  | "settings"
  | "logout"
  | string;

interface SidebarProps {
  activeView: ActiveViewType;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView }) => {
  const location = useLocation();
  const theme = useTheme();
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const [managementSectionOpen, setManagementSectionOpen] =
    React.useState(true);

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

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  const logoHeaderBackgroundColor = "#FFFFFF";
  const menuItemDefaultColor = theme.palette.grey[700];
  const menuItemHoverBg = theme.palette.action.hover;
  const activeMenuItemBg = "rgba(48, 112, 196, 0.95)";
  const activeMenuItemColor = "#FFFFFF";
  const activeMenuItemHoverBg = "rgba(40, 90, 160, 0.95)";

  const menuItems = [
    {
      text: "Dashboard",
      icon: <DashboardIcon />,
      onClick: handleManagementSectionToggle,
      open: managementSectionOpen,
      active: ["users", "managers", "teams"].includes(activeView),
      isParent: true,
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
    {
      text: "Logout",
      icon: <LogoutIcon />,
      id: "logout",
      onClick: handleLogout,
    },
  ];

  const drawerContent = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#FFFFFF",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          py: 4,
          px: 2,
          backgroundColor: logoHeaderBackgroundColor,
          // borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <a href="https://seta-international.com" >
          <img
            src={appLogo}
            alt="App Logo"
            style={{
              height: "100%",
              maxWidth: "100%",
              objectFit: "contain",
            }}
          />
        </a>
      </Toolbar>
      <List sx={{ flexGrow: 1, pt: 1, px: 1.5 }}>
        {menuItems.map((item) => {
          const isItemSelected = item.active || activeView === item.id;
          return (
            <React.Fragment key={item.text}>
              <ListItemButton
                component={
                  item.path &&
                  (!item.subItems || item.subItems.length === 0) &&
                  !item.onClick
                    ? RouterLink
                    : "div"
                }
                to={item.path}
                selected={isItemSelected}
                onClick={item.onClick}
                sx={{
                  borderRadius: "8px",
                  mb: 0.5,
                  color: isItemSelected
                    ? activeMenuItemColor
                    : menuItemDefaultColor,
                  backgroundColor: isItemSelected
                    ? activeMenuItemBg
                    : "transparent",
                  "&:hover": {
                    backgroundColor: isItemSelected
                      ? activeMenuItemHoverBg
                      : menuItemHoverBg,
                  },
                  "&.Mui-selected": {
                    backgroundColor: activeMenuItemBg,
                    color: activeMenuItemColor,
                    "& .MuiListItemIcon-root": { color: activeMenuItemColor },
                    "&:hover": { backgroundColor: activeMenuItemHoverBg },
                  },
                }}
              >
                <ListItemIcon sx={{ color: "inherit", minWidth: "40px" }}>
                  {" "}
                  {item.icon}{" "}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isItemSelected ? "bold" : "normal",
                  }}
                />
                {item.subItems && item.subItems.length > 0 ? (
                  item.open ? (
                    <ExpandLess sx={{ color: "inherit" }} />
                  ) : (
                    <ExpandMore sx={{ color: "inherit" }} />
                  )
                ) : null}
              </ListItemButton>
              {item.subItems && item.subItems.length > 0 && (
                <Collapse in={item.open} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ pl: 2 }}>
                    {item.subItems.map((subItem) => {
                      const isSubItemSelected = activeView === subItem.id;
                      return (
                        <ListItemButton
                          key={subItem.text}
                          component={RouterLink}
                          to={subItem.path}
                          selected={isSubItemSelected}
                          sx={{
                            borderRadius: "8px",
                            mb: 0.5,
                            color: isSubItemSelected
                              ? activeMenuItemColor
                              : menuItemDefaultColor,
                            backgroundColor: isSubItemSelected
                              ? activeMenuItemBg
                              : "transparent",
                            "&:hover": {
                              backgroundColor: isSubItemSelected
                                ? activeMenuItemHoverBg
                                : menuItemHoverBg,
                            },
                            "&.Mui-selected": {
                              backgroundColor: activeMenuItemBg,
                              color: activeMenuItemColor,
                              "& .MuiListItemIcon-root": {
                                color: activeMenuItemColor,
                              },
                              "&:hover": {
                                backgroundColor: activeMenuItemHoverBg,
                              },
                            },
                          }}
                        >
                          <ListItemIcon
                            sx={{ color: "inherit", minWidth: "36px" }}
                          >
                            {" "}
                            {subItem.icon}{" "}
                          </ListItemIcon>
                          <ListItemText
                            primary={subItem.text}
                            primaryTypographyProps={{
                              fontWeight: isSubItemSelected ? "bold" : "normal",
                            }}
                          />
                        </ListItemButton>
                      );
                    })}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          );
        })}
      </List>
      <Box sx={{ pb: 1, px: 1.5 }}>
        <Divider sx={{ my: 1 }} />
        <List>
          {bottomMenuItems.map((item) => {
            const isItemSelected = activeView === item.id;
            return (
              <ListItemButton
                key={item.text}
                component={item.onClick ? "div" : RouterLink}
                to={item.path}
                selected={isItemSelected && item.id !== "logout"}
                onClick={item.onClick}
                sx={{
                  borderRadius: "8px",
                  mb: 0.5,
                  color:
                    isItemSelected && item.id !== "logout"
                      ? activeMenuItemColor
                      : item.id === "logout"
                      ? "red"
                      : menuItemDefaultColor,
                  backgroundColor:
                    isItemSelected && item.id !== "logout"
                      ? activeMenuItemBg
                      : "transparent",
                  "&:hover": {
                    backgroundColor:
                      isItemSelected && item.id !== "logout"
                        ? activeMenuItemHoverBg
                        : menuItemHoverBg,
                  },
                  "&.Mui-selected": {
                    backgroundColor: activeMenuItemBg,
                    color: activeMenuItemColor,
                    "& .MuiListItemIcon-root": {
                      color: activeMenuItemColor,
                    },
                    "&:hover": {
                      backgroundColor: activeMenuItemHoverBg,
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ color: "inherit", minWidth: "40px" }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight:
                      isItemSelected && item.id !== "logout"
                        ? "bold"
                        : "normal",
                  }}
                />
              </ListItemButton>
            );
          })}
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
          backgroundColor: "#FFFFFF",
          borderRight: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
