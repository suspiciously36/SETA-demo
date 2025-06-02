// src/components/layout/FolderLayout.tsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Toolbar,
  Typography,
  CssBaseline,
  TextField,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import Sidebar from "./Sidebar";
import TopBar from "./Topbar";
import { Outlet, useLocation, useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { Folder, UpdateFolderDto } from "../../types/folder.types";
import { submitFolderUpdate } from "../../store/actions/folderActions"; // Removed unused fetchUserFolders, fetchTeamForEdit
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import { showSnackbar } from "../../store/actions/notificationActions";

const FolderLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const { folderId } = useParams<{ folderId?: string }>();

  const [activeSidebarView, setActiveSidebarView] = useState<string>("folders");

  // **MODIFIED SELECTORS**
  // Select individual pieces of state
  const allFolders = useSelector((state: RootState) => state.folders.folders);
  const isListLoading = useSelector(
    (state: RootState) => state.folders.loading
  );
  // const listError = useSelector((state: RootState) => state.folders.error); // Not used in current JSX

  // Derive currentFolder using useMemo to avoid re-calculating on every render unless dependencies change
  const currentFolder = useMemo(() => {
    if (!folderId || !allFolders) return null;
    return allFolders.find((f) => f.id === folderId) || null;
  }, [folderId, allFolders]);

  // Select updating status for the specific folder if folderId is present
  const isUpdatingThisFolder = useSelector((state: RootState) =>
    folderId ? state.folders.updatingLoading[folderId] || false : false
  );
  const updateErrorForThisFolder = useSelector((state: RootState) =>
    folderId && state.folders.updatingError
      ? state.folders.updatingError[folderId] || null
      : null
  );

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editableTitleText, setEditableTitleText] = useState("");
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false); // To track if initial load attempt happened

  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editableDescriptionText, setEditableDescriptionText] = useState("");

  useEffect(() => {
    if (folderId) {
      setActiveSidebarView(`folders/${folderId}`);
      if (currentFolder) {
        setEditableTitleText(currentFolder.name);
        setEditableDescriptionText(currentFolder.description);
        setIsEditingTitle(false);
        setIsEditingDescription(false);
        setHasAttemptedLoad(true);
      } else if (!isListLoading && folderId) {
        setEditableTitleText("Folder not found");
        setHasAttemptedLoad(true);
      } else if (isListLoading && folderId) {
        setEditableTitleText("Loading folder...");
        setHasAttemptedLoad(false);
      }
    } else {
      setActiveSidebarView("folders");
      setEditableTitleText("My Folders Overview");
      setEditableDescriptionText("My Folders Description");
      setIsEditingTitle(false);
      setIsEditingDescription(false);
      setHasAttemptedLoad(true);
    }
  }, [
    folderId,
    currentFolder,
    isListLoading,
    location.pathname,
    navigate,
    isUpdatingThisFolder,
  ]);

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditableTitleText(event.target.value);
  };
  const handleTitleEditSubmit = async () => {
    if (
      !folderId ||
      !currentFolder ||
      editableTitleText.trim() === currentFolder.name
    ) {
      setIsEditingTitle(false);
      if (currentFolder) setEditableTitleText(currentFolder.name);
      return;
    }
    if (!editableTitleText.trim()) {
      dispatch(showSnackbar("Folder name cannot be empty.", "error"));
      setEditableTitleText(currentFolder.name);
      setIsEditingTitle(false);
      return;
    }
    const updateDto: UpdateFolderDto = { name: editableTitleText.trim() };
    try {
      await dispatch(submitFolderUpdate(folderId, updateDto));
    } catch (error) {
      console.error("Failed to update folder name:", error);
      setEditableTitleText(currentFolder.name);
    } finally {
      setIsEditingTitle(false);
    }
  };
  const handleTitleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleTitleEditSubmit();
    } else if (event.key === "Escape") {
      setIsEditingTitle(false);
      if (currentFolder) setEditableTitleText(currentFolder.name);
    }
  };

  const handleDescriptionChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setEditableDescriptionText(event.target.value);
  };
  const handleDescriptionEditSubmit = async () => {
    if (
      !folderId ||
      !currentFolder ||
      editableDescriptionText.trim() === currentFolder.description
    ) {
      setIsEditingDescription(false);
      if (currentFolder) setEditableDescriptionText(currentFolder.description);
      return;
    }
    if (!editableDescriptionText.trim()) {
      dispatch(showSnackbar("Folder description cannot be empty.", "error"));
      setEditableDescriptionText(currentFolder.description);
      setIsEditingDescription(false);
      return;
    }
    const updateDto: UpdateFolderDto = {
      description: editableDescriptionText.trim(),
    };
    try {
      await dispatch(submitFolderUpdate(folderId, updateDto));
    } catch (error) {
      console.error("Failed to update folder description:", error);
      setEditableDescriptionText(currentFolder.description);
    } finally {
      setIsEditingDescription(false);
    }
  };
  const handleDescriptionKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleDescriptionEditSubmit();
    } else if (event.key === "Escape") {
      setIsEditingDescription(false);
      if (currentFolder) setEditableDescriptionText(currentFolder.name);
    }
  };

  let displayTitle = "My Folders Overview";
  if (folderId) {
    if (isListLoading && !currentFolder && !hasAttemptedLoad)
      displayTitle = "Loading folder...";
    else if (currentFolder) displayTitle = `${currentFolder.name}`;
    else if (!isListLoading && !currentFolder)
      displayTitle = "Folder not found";
  }
  let displayDescription = "My Folders Description";
  if (folderId) {
    if (isListLoading && !currentFolder && !hasAttemptedLoad)
      displayDescription = "Loading folder...";
    else if (currentFolder) displayDescription = `${currentFolder.description}`;
    else if (!isListLoading && !currentFolder)
      displayDescription = "Folder not found";
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <CssBaseline />
      <Sidebar activeView={activeSidebarView} />
      <TopBar />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          background:
            "linear-gradient(180deg, #fff 0%,rgb(166, 197, 240) 100%)",
          pt: 0,
          px: 3,
          pb: 3,
          overflowY: "auto",
        }}
      >
        <Toolbar />

        <Box sx={{ display: "flex", alignItems: "center", my: 3 }}>
          {isEditingTitle && folderId && currentFolder ? (
            <TextField
              value={editableTitleText}
              onChange={handleTitleChange}
              onBlur={handleTitleEditSubmit}
              onKeyDown={handleTitleKeyDown}
              autoFocus
              variant="standard"
              size="small"
              sx={{
                flexGrow: 1,
                "& .MuiInputBase-input": {
                  typography: "h3",
                  fontWeight: "bold",
                  paddingBottom: "2px",
                },
              }}
              InputProps={{
                endAdornment: isUpdatingThisFolder ? (
                  <CircularProgress size={20} />
                ) : (
                  <IconButton
                    onClick={handleTitleEditSubmit}
                    size="small"
                    edge="end"
                  >
                    {" "}
                    <CheckIcon fontSize="small" />{" "}
                  </IconButton>
                ),
              }}
            />
          ) : (
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: "bold",
                flexGrow: 1,
                cursor: folderId && currentFolder ? "pointer" : "default",
              }}
              onClick={() =>
                folderId && currentFolder && setIsEditingTitle(true)
              }
            >
              {displayTitle}
            </Typography>
          )}

          {folderId && currentFolder && !isEditingTitle && (
            <IconButton
              onClick={() => setIsEditingTitle(true)}
              size="small"
              sx={{ ml: 1 }}
            >
              {" "}
              <EditIcon fontSize="small" />{" "}
            </IconButton>
          )}
        </Box>
        {updateErrorForThisFolder && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to update folder name: {updateErrorForThisFolder}
          </Alert>
        )}

        {/*Description */}
        <Box sx={{ display: "flex", alignItems: "center", my: 3 }}>
          {isEditingDescription && folderId && currentFolder ? (
            <TextField
              value={editableDescriptionText}
              onChange={handleDescriptionChange}
              onBlur={handleDescriptionEditSubmit}
              onKeyDown={handleDescriptionKeyDown}
              autoFocus
              variant="standard"
              size="small"
              sx={{
                flexGrow: 1,
                "& .MuiInputBase-input": {
                  typography: "h5",
                  fontWeight: "normal",
                  paddingBottom: "2px",
                },
              }}
              InputProps={{
                endAdornment: isUpdatingThisFolder ? (
                  <CircularProgress size={20} />
                ) : (
                  <IconButton
                    onClick={handleDescriptionEditSubmit}
                    size="small"
                    edge="end"
                  >
                    {" "}
                    <CheckIcon fontSize="small" />{" "}
                  </IconButton>
                ),
              }}
            />
          ) : (
            <Typography
              variant="h5"
              component="h2"
              sx={{
                fontStyle: "italic",
                fontWeight: "normal",
                flexGrow: 1,
                cursor: folderId && currentFolder ? "pointer" : "default",
              }}
              onClick={() =>
                folderId && currentFolder && setIsEditingDescription(true)
              }
            >
              {displayDescription}
            </Typography>
          )}
          {folderId && currentFolder && !isEditingDescription && (
            <IconButton
              onClick={() => setIsEditingDescription(true)}
              size="small"
              sx={{ ml: 1 }}
            >
              {" "}
              <EditIcon fontSize="small" />{" "}
            </IconButton>
          )}
        </Box>

        <Outlet />
      </Box>
    </Box>
  );
};

export default FolderLayout;
