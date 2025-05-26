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
import { RootState } from "../../store";
import { getInitials } from "../../utils/helpers/getInitials.ts";

const drawerWidth = 300;

const TopBar: React.FC<any> = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <AppBar
      position="absolute"
      sx={{
        width: `calc(100% - ${drawerWidth}px)`,
        ml: `${drawerWidth}px`,
        backgroundColor: "rgba(255,255,255,0.1)",
        color: "text.primary",
        boxShadow: "0 0px 0px rgba(0,0,0,0.1)",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", px: 3 }}>
        {" "}
        <Box
          sx={{
            display: "flex",
            width: "100%",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography
            variant="h6"
            sx={{ mr: 1.5, color: "rgba(48, 112, 196, 1)" }}
          >
            Welcome, {user?.username || "User"}
          </Typography>
          <IconButton sx={{ p: 0 }}>
            <Avatar alt={user?.username || "User"}>
              {getInitials(user?.username)}
            </Avatar>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
