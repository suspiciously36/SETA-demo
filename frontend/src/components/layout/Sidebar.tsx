import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
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
  CircularProgress,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import LogoutIcon from "@mui/icons-material/Logout";
import FolderIcon from "@mui/icons-material/Folder";
import FolderCopyIcon from "@mui/icons-material/FolderCopy";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import SortIcon from "@mui/icons-material/Sort";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import FolderSharedIcon from "@mui/icons-material/FolderShared";

import { logoutUser } from "../../store/actions/authActions";
import { AppDispatch, type RootState } from "../../store";

import appLogo from "../../assets/images/seta-removebg-preview.png";
import {
  fetchUserFolders,
  submitFolderDelete,
  submitNewFolder,
} from "../../store/actions/folderActions.ts";
import type { CreateFolderDto, Folder } from "../../types/folder.types.ts";
import { showSnackbar } from "../../store/actions/notificationActions.ts";
import { UserRole } from "../../types/user.types.ts";
import type { CreateNoteDto } from "../../types/note.types.ts";
import {
  fetchUserNotes,
  submitNewNote,
} from "../../store/actions/noteActions.ts";
import { FolderAccessLevel, type Folder } from "../../types/folder.types.ts";

const drawerWidth = 320;

type ActiveViewType =
  | "users"
  | "teams"
  | "managers"
  | `folders/${string}`
  | `folders/${string}/notes/${string}`
  | `shared-folders/${string}`
  | `shared-folders/${string}/notes/${string}`
  | "notifications"
  | "profile"
  | "settings"
  | "logout"
  | string;

interface SidebarProps {
  activeView: ActiveViewType;
}

const SHOW_OPTIONS = [5, 10, 15, 20, "All"];

const Sidebar: React.FC<SidebarProps> = ({ activeView }) => {
  const location = useLocation();
  const theme = useTheme();
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const authUser = useSelector((state: RootState) => state.auth.user);
  const {
    folders, // Folder[] with accessLevel
    loading: foldersLoading,
    creatingLoading: creatingFolderLoading,
  } = useSelector((state: RootState) => state.folders);

  const { creatingLoading: creatingNoteLoading } = useSelector(
    (state: RootState) => state.notes
  );

  const [folderOptionsAnchorEl, setFolderOptionsAnchorEl] =
    useState<null | HTMLElement>(null);
  const [showItemsCount, setShowItemsCount] = useState<number | "All">(5);
  const [showSubMenuAnchorEl, setShowSubMenuAnchorEl] =
    useState<null | HTMLElement>(null);

  const [managementSectionOpen, setManagementSectionOpen] =
    React.useState(true);
  const [myFoldersOpen, setMyFoldersOpen] = useState(true);
  const [sharedFoldersOpen, setSharedFoldersOpen] = useState(true);

  useEffect(() => {
    dispatch(fetchUserFolders());
    dispatch(fetchUserNotes());
  }, [dispatch]);

  useEffect(() => {
    if (
      ["/users", "/managers", "/teams"].some((path) =>
        location.pathname.startsWith(path)
      )
    ) {
      setManagementSectionOpen(true);
      setMyFoldersOpen(false);
      setSharedFoldersOpen(false);
    }
    if (location.pathname.startsWith("/folders")) {
      setMyFoldersOpen(true);
      setManagementSectionOpen(false);
      setSharedFoldersOpen(false);
    }
    if (location.pathname.startsWith("/shared-folders")) {
      setSharedFoldersOpen(true);
      setManagementSectionOpen(false);
      setMyFoldersOpen(false);
    }
  }, [location.pathname]);

  const handleManagementSectionToggle = () => {
    setManagementSectionOpen(!managementSectionOpen);
  };

  const handleMyFoldersToggle = () => setMyFoldersOpen(!myFoldersOpen);
  const handleSharedFoldersToggle = () =>
    setSharedFoldersOpen(!sharedFoldersOpen);

  const handleCreateNewFolder = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const untitledFolders = "Untitled Folder";

    const folderData: CreateFolderDto = {
      name: untitledFolders,
      description: "default description",
    };
    try {
      const newFolder = (await dispatch(
        submitNewFolder(folderData)
      )) as Folder | void;
      if (newFolder && newFolder.id) {
        navigate(`/folders/${newFolder.id}`);
      }
    } catch (error) {
      console.error("Failed to create folder directly:", error);
    }
  };

  const handleCreateNewNote = async (e: React.MouseEvent, folderId: string) => {
    e.stopPropagation();
    e.preventDefault();

    const noteData: CreateNoteDto = {
      title: "Untitled Note",
      body: "",
      tags: [],
      folderId,
    };
    try {
      if (folderId) {
        const folder = folders.find((f: Folder) => f.id === folderId);
        const isShared =
          folder &&
          (folder.access_level === FolderAccessLevel.READ ||
            folder.access_level === FolderAccessLevel.WRITE);
        await dispatch(submitNewNote(folderId, noteData));
        if (isShared) {
          navigate(`/shared-folders/${folderId}`);
        } else {
          navigate(`/folders/${folderId}`);
        }
      }
    } catch (error) {
      console.error("Failed to create note from sidebar:", error);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  const handleFolderOptionsOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setFolderOptionsAnchorEl(event.currentTarget);
  };
  const handleFolderOptionsClose = () => {
    setFolderOptionsAnchorEl(null);
  };

  const handleShowSubMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setShowSubMenuAnchorEl(event.currentTarget);
  };
  const handleShowSubMenuClose = () => {
    setShowSubMenuAnchorEl(null);
  };

  const handleSetShowItemsCount = (count: number | "All") => {
    setShowItemsCount(count);
    handleShowSubMenuClose();
    handleFolderOptionsClose();
  };

  const handleDeleteFolderClick = async (
    e: React.MouseEvent,
    folder: Folder
  ) => {
    e.stopPropagation();
    e.preventDefault();
    if (
      window.confirm(
        `Are you sure you want to delete the folder "${folder.name}" and all its notes? This action cannot be undone.`
      )
    ) {
      try {
        await dispatch(submitFolderDelete(folder.id));
        dispatch(showSnackbar(`Folder "${folder.name}" deleted.`, "success"));
        if (location.pathname === `/folders/${folder.id}`) {
          navigate("/folders");
        }
      } catch (error: any) {
        dispatch(
          showSnackbar(error.message || "Failed to delete folder.", "error")
        );
      }
    }
  };

  const logoHeaderBackgroundColor = "#FFFFFF";
  const menuItemDefaultColor = theme.palette.grey[700];
  const menuItemHoverBg = theme.palette.action.hover;
  const activeMenuItemBg = "rgba(48, 112, 196, 0.9)";
  const activeMenuItemColor = "#FFFFFF";
  const activeMenuItemHoverBg = "rgba(40, 90, 160, 0.9)";

  const myFolders = useMemo(
    () =>
      Array.isArray(folders)
        ? folders.filter(
            (f: Folder) => f.access_level === FolderAccessLevel.OWNER
          )
        : [],
    [folders]
  );

  const sharedFolders = useMemo(
    () =>
      Array.isArray(folders)
        ? folders.filter(
            (f: Folder) =>
              f.access_level === FolderAccessLevel.READ ||
              f.access_level === FolderAccessLevel.WRITE
          )
        : [],
    [folders]
  );

  const displayedMyFolders = useMemo(() => {
    if (showItemsCount === "All" || !Array.isArray(myFolders))
      return myFolders || [];
    return myFolders.slice(0, showItemsCount);
  }, [myFolders, showItemsCount]);

  const displayedSharedFolders = useMemo(() => {
    if (showItemsCount === "All" || !Array.isArray(sharedFolders))
      return sharedFolders || [];
    return sharedFolders.slice(0, showItemsCount);
  }, [sharedFolders, showItemsCount]);

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
      text: "My Folders",
      icon: <FolderCopyIcon />,
      onClick: handleMyFoldersToggle,
      open: myFoldersOpen,
      active: activeView.startsWith("folders"),
      isHeader: true,
      subItems:
        foldersLoading && (!myFolders || myFolders.length === 0)
          ? [
              {
                text: "Loading folders...",
                icon: <CircularProgress size={18} sx={{ ml: 0.5 }} />,
                id: "loading",
                disabled: true,
              },
            ]
          : displayedMyFolders.map((folder) => ({
              text: folder.name,
              icon: <FolderIcon fontSize="small" />,
              path: `/folders/${folder.id}`,
              id: `folders/${folder.id}`,
              originalFolder: folder,
            })),
    },
    {
      text: "Shared Folders",
      icon: <FolderSharedIcon />,
      onClick: handleSharedFoldersToggle,
      open: sharedFoldersOpen,
      active: activeView.startsWith("shared-folders"),
      isHeader: true,
      subItems:
        foldersLoading && (!sharedFolders || sharedFolders.length === 0)
          ? [
              {
                text: "Loading folders...",
                icon: <CircularProgress size={18} sx={{ ml: 0.5 }} />,
                id: "loading-shared",
                disabled: true,
              },
            ]
          : displayedSharedFolders.map((folder) => ({
              text: folder.name,
              icon: <FolderSharedIcon fontSize="small" />,
              path: `/shared-folders/${folder.id}`,
              id: `shared-folders/${folder.id}`,
              originalFolder: folder,
            })),
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

  const renderListItem = (item: any, isSubItem: boolean = false) => {
    let isActive = false;
    if (item.id === "loading") {
      isActive = false;
    } else if (item.active !== undefined) {
      isActive = item.active;
    } else {
      if (
        item.id &&
        typeof item.id === "string" &&
        item.id.startsWith("folders/")
      ) {
        const folderPath = `/folders/${item.originalFolder?.id}`;
        isActive =
          location.pathname === folderPath ||
          location.pathname.startsWith(`${folderPath}/`);
      } else if (
        item.id &&
        typeof item.id === "string" &&
        item.id.startsWith("shared-folders/")
      ) {
        const sharedFolderPath = `/shared-folders/${item.originalFolder?.id}`;
        isActive =
          location.pathname === sharedFolderPath ||
          location.pathname.startsWith(`${sharedFolderPath}/`);
      } else {
        isActive = activeView === item.id || location.pathname === item.path;
      }
    }

    const isFolderSubItem =
      item.id && typeof item.id === "string" && item.id.startsWith("folders/");
    const folderData = item.originalFolder as Folder | undefined;
    const canDeleteThisFolder =
      authUser &&
      folderData &&
      (authUser.role === UserRole.ROOT || authUser.id === folderData.owner_id);

    let canAddNoteToThisFolder = false;
    if (authUser && folderData && folderData.access_level) {
      if (
        authUser.role === UserRole.ROOT ||
        folderData.access_level === FolderAccessLevel.OWNER ||
        folderData.access_level === FolderAccessLevel.WRITE
      ) {
        canAddNoteToThisFolder = true;
      }
    }

    if (
      (item.isHeader && item.text === "My Folders") ||
      item.text === "Shared Folders"
    ) {
      return (
        <ListItemButton
          onClick={item.onClick}
          selected={isActive}
          sx={{
            pl: isSubItem ? 4 : 2,
            mx: 2,
            borderRadius: "8px",
            mb: 0.5,
            color: isActive ? activeMenuItemColor : menuItemDefaultColor,
            backgroundColor: isActive ? activeMenuItemBg : "transparent",
            "&:hover": {
              backgroundColor: isActive
                ? activeMenuItemHoverBg
                : menuItemHoverBg,
              "& .sidebar-parent-action": {
                opacity: 1,
                pointerEvents: "auto",
              },
            },
            "&.Mui-selected": {
              backgroundColor: activeMenuItemBg,
              color: activeMenuItemColor,
              "& .MuiListItemIcon-root, & .MuiSvgIcon-root": {
                color: activeMenuItemColor,
              },
              "&:hover": { backgroundColor: activeMenuItemHoverBg },
            },
            pr: isFolderSubItem ? 1 : 2,
          }}
        >
          <ListItemIcon
            sx={{ color: "inherit", minWidth: isSubItem ? "36px" : "40px" }}
          >
            {item.icon}
          </ListItemIcon>
          <ListItemText
            primary={item.text}
            primaryTypographyProps={{
              fontWeight: isActive ? "bold" : "medium",
              noWrap: true,
              style: {
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flexGrow: 1,
                marginRight: "8px",
              },
            }}
          />
          <Box
            className="sidebar-parent-action"
            sx={{
              display: "flex",
              alignItems: "center",
              opacity: 0,
              pointerEvents: "none",
              transition: (t) =>
                t.transitions.create("opacity", {
                  duration: t.transitions.duration.shortest,
                }),
            }}
          >
            <Tooltip title="More options">
              <IconButton
                onClick={handleFolderOptionsOpen}
                edge="end"
                size="small"
                sx={{ mr: 0.5, color: "inherit" }}
              >
                <MoreHorizIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {item.text === "My Folders" ? (
              <Tooltip title="New Folder">
                <IconButton
                  onClick={handleCreateNewFolder}
                  edge="end"
                  size="small"
                  disabled={creatingFolderLoading}
                >
                  {creatingFolderLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <AddCircleOutlineIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="You cannot create new folder in Shared Folders">
                <span>
                  <IconButton edge="end" size="small" disabled>
                    <AddCircleOutlineIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            )}
          </Box>
        </ListItemButton>
      );
    }

    return (
      <ListItemButton
        key={item.text}
        component={item.path && !item.onClick ? RouterLink : "div"}
        to={item.path}
        selected={isActive}
        onClick={item.onClick}
        disabled={item.disabled}
        sx={{
          pl: isSubItem ? 4 : 2,
          mx: 2,
          borderRadius: "8px",
          mb: 0.5,
          color: isActive ? activeMenuItemColor : menuItemDefaultColor,
          backgroundColor: isActive ? activeMenuItemBg : "transparent",
          "&:hover": {
            backgroundColor: isActive ? activeMenuItemHoverBg : menuItemHoverBg,
          },
          "&:hover .folder-item-action-button": {
            opacity: 1,
          },
          "&.Mui-selected": {
            backgroundColor: activeMenuItemBg,
            color: activeMenuItemColor,
            "& .MuiListItemIcon-root": { color: activeMenuItemColor },
            "&:hover": { backgroundColor: activeMenuItemHoverBg },
            "&:hover .folder-item-action-button": {
              opacity: 1,
            },
          },
        }}
      >
        <ListItemIcon
          sx={{ color: "inherit", minWidth: isSubItem ? "36px" : "40px" }}
        >
          {" "}
          {item.icon}{" "}
        </ListItemIcon>
        <ListItemText
          primary={item.text}
          primaryTypographyProps={{
            fontWeight: isActive ? "bold" : "normal",
            noWrap: true,
          }}
        />
        {item.subItems && item.subItems.length > 0 && !item.isHeader ? (
          item.open ? (
            <ExpandLess sx={{ color: "inherit" }} />
          ) : (
            <ExpandMore sx={{ color: "inherit" }} />
          )
        ) : null}

        {isFolderSubItem && folderData && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              ml: "auto",
            }}
          >
            {canDeleteThisFolder && (
              <Tooltip title="Delete folder">
                <IconButton
                  className="folder-item-action-button"
                  edge="end"
                  size="small"
                  onClick={(e) => handleDeleteFolderClick(e, folderData)}
                  sx={{
                    opacity: 0,
                    transition: (t) =>
                      t.transitions.create("opacity", {
                        duration: t.transitions.duration.shortest,
                      }),
                    color: isActive
                      ? activeMenuItemColor
                      : theme.palette.action.active,
                    "&:hover": {
                      opacity: 1,
                      color: "error.main",
                    },
                  }}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {canAddNoteToThisFolder && (
              <Tooltip title="New Note in this Folder">
                <IconButton
                  className="folder-item-action-button"
                  edge="end"
                  size="small"
                  onClick={(e) => handleCreateNewNote(e, folderData.id)}
                  disabled={creatingNoteLoading || creatingFolderLoading}
                  sx={{
                    opacity: 0,
                    transition: (t) =>
                      t.transitions.create("opacity", {
                        duration: t.transitions.duration.shortest,
                      }),
                    color: isActive
                      ? activeMenuItemColor
                      : theme.palette.action.active,
                    "&:hover": {
                      opacity: 1,
                      color: "#ccc",
                    },
                    ml: canDeleteThisFolder ? 0.5 : 0,
                    p: 0.5,
                  }}
                >
                  {creatingNoteLoading ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <NoteAddIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}
      </ListItemButton>
    );
  };

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
        }}
      >
        <a href="https://seta-international.com">
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
      <List sx={{ flexGrow: 1, pt: 1 }}>
        {menuItems.map((item) => (
          <React.Fragment key={item.text}>
            {renderListItem(item, false)}
            {item.subItems && item.subItems.length > 0 && (
              <Collapse in={item.open} timeout="auto" unmountOnExit>
                <List
                  component="div"
                  disablePadding
                  sx={{
                    pl: 2,
                  }}
                >
                  {item.subItems.map((subItem) =>
                    renderListItem(subItem, true)
                  )}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
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
    <>
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

      <Menu
        anchorEl={folderOptionsAnchorEl}
        open={Boolean(folderOptionsAnchorEl)}
        onClose={handleFolderOptionsClose}
        MenuListProps={{ "aria-labelledby": "folder-options-button" }}
        PaperProps={{
          sx: { boxShadow: theme.shadows[3], borderRadius: "8px" },
        }}
      >
        <MenuItem disabled sx={{ pointerEvents: "none" }}>
          {" "}
          <ListItemIcon sx={{ minWidth: 36 }}>
            <SortIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ variant: "body2" }}>
            Sort
          </ListItemText>
          <Typography variant="body2" color="text.secondary" sx={{ pl: 2 }}>
            Manual
          </Typography>
          <ArrowRightIcon fontSize="small" sx={{ color: "text.disabled" }} />
        </MenuItem>
        <MenuItem onClick={handleShowSubMenuOpen}>
          <ListItemIcon sx={{ minWidth: 36 }}>
            <FolderIcon fontSize="small" />
          </ListItemIcon>{" "}
          <ListItemText primaryTypographyProps={{ variant: "body2" }}>
            Show
          </ListItemText>
          <Typography variant="body2" color="text.secondary" sx={{ pl: 2 }}>
            {showItemsCount === "All" ? "All" : showItemsCount}
          </Typography>
          <ArrowRightIcon fontSize="small" />
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={showSubMenuAnchorEl}
        open={Boolean(showSubMenuAnchorEl)}
        onClose={handleShowSubMenuClose}
        MenuListProps={{ "aria-labelledby": "show-options-button" }}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{
          sx: { boxShadow: theme.shadows[3], borderRadius: "8px", mt: -1 },
        }}
      >
        {SHOW_OPTIONS.map((count) => (
          <MenuItem
            key={count}
            selected={count === showItemsCount}
            onClick={() => handleSetShowItemsCount(count)}
            sx={{ fontSize: "0.875rem", minHeight: "36px" }}
          >
            {count === "All" ? "All items" : `${count} items`}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default Sidebar;
