// src/components/layout/TopBar.tsx
import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Box,
} from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../../store"; // Adjust path as needed

const drawerWidth = 300; // Same as Sidebar width

interface TopBarProps {
  // Add props if needed, e.g., for handling mobile drawer toggle
}

// Helper to get initials for Avatar fallback
const getInitials = (name: string = "") => {
  if (!name) return "U";
  const nameParts = name.split(" ");
  if (nameParts.length > 1 && nameParts[0] && nameParts[1]) {
    return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
  } else if (
    nameParts.length === 1 &&
    nameParts[0] &&
    nameParts[0].length > 0
  ) {
    return `${nameParts[0][0]}`.toUpperCase();
  }
  return "U";
};

const TopBar: React.FC<TopBarProps> = () => {
  const { user } = useSelector((state: RootState) => state.auth); // Get user from Redux store

  return (
    <AppBar
      position="fixed"
      sx={{
        width: `calc(100% - ${drawerWidth}px)`,
        ml: `${drawerWidth}px`, // Margin left to account for the permanent sidebar
        backgroundColor: "#ffffff", // White background as per UI
        color: "text.primary", // Default text color
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)", // Subtle shadow
        zIndex: (theme) => theme.zIndex.drawer + 1, // Ensure it's above the sidebar if sidebar has its own zIndex logic for variants
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", px: 3 }}>
        {" "}
        {/* Added padding */}
        <Box>
          {/* Placeholder for breadcrumbs or current page title if needed */}
          {/* <Typography variant="h6" noWrap component="div">
            Dashboard
          </Typography> */}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="body1" sx={{ mr: 1.5, color: "text.secondary" }}>
            Welcome, {user?.username || "User"}
            {/* Using username from UserProfile. Adjust if 'name' field is different */}
          </Typography>
          <IconButton sx={{ p: 0 }}>
            <Avatar
              alt={user?.username || "User"}
              src={user?.avatarUrl /* Assuming avatarUrl is in UserProfile */}
            >
              {getInitials(user?.username)}
            </Avatar>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
