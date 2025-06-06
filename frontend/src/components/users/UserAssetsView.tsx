import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, Link as RouterLink } from "react-router-dom";
import type { RootState } from "../../store/index.ts";
import { useEffect } from "react";
import {
  clearUserAssets,
  fetchUserAssets,
  setUserAssetsFolderPage,
  setUserAssetsNotePage,
} from "../../store/actions/userAssetActions.ts";
import {
  Alert,
  Box,
  Breadcrumbs,
  CircularProgress,
  Paper,
  Typography,
  Link,
  Button,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Pagination,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import NoteIcon from "@mui/icons-material/Description";
import HomeIcon from "@mui/icons-material/Home";
import GroupIcon from "@mui/icons-material/Group";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import type { Folder } from "../../types/folder.types.ts";
import type { Note } from "../../types/note.types.ts";
import { fetchUsers } from "../../store/actions/userListActions.ts";
import { fetchTeams } from "../../store/actions/teamActions.ts";

const UserAssetsView: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loggedInUser = useSelector((state: RootState) => state.auth.user);

  const {
    assets,
    loading,
    error,
    currentFolderPage,
    currentNotePage,
    currentUserId,
  } = useSelector((state: RootState) => state.userAssets);

  const user = useSelector((state: RootState) =>
    state.userList.users.find((u) => u.id === userId)
  );

  const users = useSelector((state: RootState) => state.userList.users);

  const [allFolders, setAllFolders] = React.useState<Folder[]>([]);

  const foldersData = assets?.folders.data || [];
  const notesData = assets?.notes.data || [];
  const folderPagination = assets?.folders.pagination;
  const notePagination = assets?.notes.pagination;

  useEffect(() => {
    setAllFolders((prev) => {
      const existingIds = new Set(prev.map((f) => f.id));
      const newFolders = foldersData.filter((f) => !existingIds.has(f.id));

      if (newFolders.length === 0) {
        return prev;
      }

      return [...prev, ...newFolders];
    });
  }, [foldersData]);

  useEffect(() => {
    if (userId) {
      dispatch(fetchUsers(1, 999));
      dispatch(fetchTeams(1, 999));
      if (userId !== currentUserId || !assets) {
        dispatch(fetchUserAssets(userId, 1, 1));
      }
    }
    return () => {
      dispatch(clearUserAssets());
    };
  }, [dispatch, userId, currentUserId]);

  const handleFolderPageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    if (userId) {
      dispatch(setUserAssetsFolderPage(value));
      dispatch(fetchUserAssets(userId, value, currentNotePage));
    }
  };

  const handleNotePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    if (userId) {
      dispatch(setUserAssetsNotePage(value));
      dispatch(fetchUserAssets(userId, currentFolderPage, value));
    }
  };

  const getAccessLevelText = (level: string | undefined): string => {
    if (!level) return "Unknown";
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  const getUsernameById = (userId: string | undefined): string => {
    if (!userId) return "Unknown User";
    const user = users.find((u) => u.id === userId);
    return user ? user.username : "Unknown User";
  };

  const getFolderNameById = (folderId: string) => {
    const folder = foldersData.find((f) => f.id === folderId);
    return folder ? folder.name : "Unknown";
  };

  const initialLoading = loading && (!assets || !currentUserId !== userId);

  if (initialLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading user assets...</Typography>
      </Box>
    );
  }

  if (error && !assets) {
    return <Alert severity="error">Error loading user assets: {error}</Alert>;
  }

  if (currentUserId !== userId && !loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <Typography sx={{ ml: 2 }}>
          Loading assets for user {userId}...
        </Typography>
      </Box>
    );
  }

  return (
    <Paper
      elevation={3}
      sx={{ p: { xs: 2, md: 4 }, m: { xs: 1, md: 2 }, borderRadius: "12px" }}
    >
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            component={RouterLink}
            to="/dashboard"
            sx={{ display: "flex", alignItems: "center" }}
            color="inherit"
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" /> Dashboard
          </Link>
          <Link
            component={RouterLink}
            to="/users"
            sx={{ display: "flex", alignItems: "center" }}
            color="inherit"
          >
            <GroupIcon sx={{ mr: 0.5 }} fontSize="inherit" /> Users
          </Link>
          <Typography
            color="text.primary"
            sx={{ display: "flex", alignItems: "center" }}
          >
            {user ? user.username : "User"} Assets
          </Typography>
        </Breadcrumbs>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/users")}
        >
          Back to Users
        </Button>
      </Box>

      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: "bold", color: "primary.main" }}
      >
        Assets for User: {user ? user.username : userId}
      </Typography>
      {loading && (
        <CircularProgress
          size={20}
          sx={{ display: "block", margin: "10px auto" }}
        />
      )}
      {error && (
        <Alert severity="warning" sx={{ mt: 1, mb: 2 }}>
          Could not refresh all data: {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              color: "secondary.main",
              borderBottom: "2px solid",
              borderColor: "secondary.light",
              pb: 1,
              mb: 2,
            }}
          >
            Folders ({folderPagination?.totalRecords || 0})
          </Typography>
          {foldersData.length > 0 ? (
            <>
              <List dense>
                {foldersData.map((folder: Folder) => {
                  const isOwner = folder.owner_id === loggedInUser?.id;

                  let displayAccessLevel = folder.access_level;
                  if (isOwner) {
                    displayAccessLevel = "owner";
                  }

                  const folderLink = isOwner
                    ? `/folders/${folder.id}`
                    : `/shared-folders/${folder.id}`;

                  return (
                    <ListItem
                      key={folder.id}
                      component={RouterLink}
                      to={folderLink}
                      sx={{
                        "&:hover": { backgroundColor: "action.hover" },
                        borderRadius: "8px",
                        mb: 1,
                        backgroundColor: "background.paper",
                        boxShadow: 1,
                      }}
                    >
                      <ListItemIcon sx={{ color: "primary.main" }}>
                        <FolderIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={folder.name}
                        secondary={`Access Level: ${getAccessLevelText(
                          displayAccessLevel
                        )} | Owned by: ${
                          loggedInUser?.id === folder.owner_id
                            ? "YOU"
                            : getUsernameById(folder.owner_id)
                        }`}
                      />
                    </ListItem>
                  );
                })}
              </List>
              {folderPagination && folderPagination.totalPages > 1 && (
                <Stack spacing={2} sx={{ mt: 2, alignItems: "center" }}>
                  <Pagination
                    count={folderPagination.totalPages}
                    page={folderPagination.currentPage}
                    onChange={handleFolderPageChange}
                    color="primary"
                  />
                </Stack>
              )}
            </>
          ) : (
            <Typography sx={{ fontStyle: "italic" }}>
              {!loading && "No folders accessible to this user."}
            </Typography>
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              color: "secondary.main",
              borderBottom: "2px solid",
              borderColor: "secondary.light",
              pb: 1,
              mb: 2,
            }}
          >
            Notes ({notePagination?.totalRecords || 0})
          </Typography>
          {notesData.length > 0 ? (
            <>
              <List dense>
                {notesData.map((note: Note) => {
                  const folderName = getFolderNameById(
                    note.folder_id || note.folderId
                  );
                  const folder = allFolders.find(
                    (f: Folder) => f.id === (note.folder_id || note.folderId)
                  );

                  const isFolderOwner = folder?.owner_id === loggedInUser?.id;

                  const noteLink2 = isFolderOwner
                    ? `/folders/${folder?.id}/notes/${note.id}`
                    : `/shared-folders/${folder?.id}/notes/${note.id}`;
                  return (
                    <ListItem
                      key={note.id}
                      component={RouterLink}
                      to={noteLink2}
                      sx={{
                        "&:hover": { backgroundColor: "action.hover" },
                        borderRadius: "8px",
                        mb: 1,
                        backgroundColor: "background.paper",
                        boxShadow: 1,
                      }}
                    >
                      <ListItemIcon sx={{ color: "success.main" }}>
                        <NoteIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={note.title}
                        secondary={`In Folder: ${folderName}`}
                      />
                    </ListItem>
                  );
                })}
              </List>
              {notePagination && notePagination.totalPages > 1 && (
                <Stack spacing={2} sx={{ mt: 2, alignItems: "center" }}>
                  <Pagination
                    count={notePagination.totalPages}
                    page={notePagination.currentPage}
                    onChange={handleNotePageChange}
                    color="primary"
                  />
                </Stack>
              )}
            </>
          ) : (
            <Typography sx={{ fontStyle: "italic" }}>
              {!loading && "No notes directly listed for this user."}
            </Typography>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default UserAssetsView;
