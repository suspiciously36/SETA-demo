import React, { useEffect } from "react";
import { useParams, Link as RouterLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import {
  fetchTeamAssets,
  clearTeamAssets,
  setTeamAssetsFolderPage,
  setTeamAssetsNotePage,
} from "../../store/actions/teamAssetActions";
import type { Folder } from "../../types/folder.types";
import type { Note } from "../../types/note.types";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Breadcrumbs,
  Link,
  Button,
  Grid,
  Pagination,
  Stack,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import NoteIcon from "@mui/icons-material/Description";
import HomeIcon from "@mui/icons-material/Home";
import GroupIcon from "@mui/icons-material/Group";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { fetchUsers } from "../../store/actions/userListActions.ts";
import { fetchTeams } from "../../store/actions/teamActions.ts";

const TeamAssetsView: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const loggedInUser = useSelector((state: RootState) => state.auth.user);

  const {
    assets,
    loading,
    error,
    currentTeamId,
    currentFolderPage,
    currentNotePage,
  } = useSelector((state: RootState) => state.teamAssets);

  const team = useSelector((state: RootState) =>
    state.teams.teams.find((t) => t.id === teamId)
  );

  console.log(team);

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
    if (teamId) {
      dispatch(fetchUsers(1, 999));
      dispatch(fetchTeams(1, 999));
      if (teamId !== currentTeamId || !assets) {
        dispatch(fetchTeamAssets(teamId, 1, 1));
      }
    }
    return () => {
      dispatch(clearTeamAssets());
    };
  }, [dispatch, teamId, currentTeamId]);

  const getAccessLevelText = (level: string | undefined): string => {
    if (!level) return "Unknown";
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  const getFolderNameById = (folderId: string) => {
    const folder = allFolders.find((f) => f.id === folderId);
    return folder ? folder.name : "Unknown";
  };

  const getUsernameById = (userId: string | undefined): string => {
    if (!userId) return "Unknown User";
    const user = users.find((u) => u.id === userId);
    return user ? user.username : "Unknown User";
  };

  const handleFolderPageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    if (teamId) {
      dispatch(setTeamAssetsFolderPage(value));
      dispatch(fetchTeamAssets(teamId, value, currentNotePage));
    }
  };

  const handleNotePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    if (teamId) {
      dispatch(setTeamAssetsNotePage(value));
      dispatch(fetchTeamAssets(teamId, currentFolderPage, value));
    }
  };

  if (!teamId) {
    return <Alert severity="error">No Team ID provided.</Alert>;
  }

  const initialLoading = loading && (!assets || currentTeamId !== teamId);

  if (initialLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading team assets...</Typography>
      </Box>
    );
  }

  if (error && !assets) {
    return <Alert severity="error">Error loading team assets: {error}</Alert>;
  }

  if (currentTeamId !== teamId && !loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <Typography sx={{ ml: 2 }}>
          Loading assets for team {teamId}...
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
            to="/teams"
            sx={{ display: "flex", alignItems: "center" }}
            color="inherit"
          >
            <GroupIcon sx={{ mr: 0.5 }} fontSize="inherit" /> Teams
          </Link>
          <Typography
            color="text.primary"
            sx={{ display: "flex", alignItems: "center" }}
          >
            {team ? team.team_name : "Team"} Assets
          </Typography>
        </Breadcrumbs>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/teams")}
        >
          Back to Teams
        </Button>
      </Box>

      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: "bold", color: "primary.main" }}
      >
        Assets for Team: {team ? team.team_name : teamId}
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

                  return (
                    <ListItem
                      key={folder.id}
                      component={RouterLink}
                      to={
                        displayAccessLevel === "read" ||
                        displayAccessLevel === "write"
                          ? `/shared-folders/${folder.id}`
                          : `/folders/${folder.id}`
                      }
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
              {!loading && "No folders accessible to this team."}
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
                  const isShared =
                    folder &&
                    (folder.access_level === "read" ||
                      folder.access_level === "write");
                  const noteLink = isShared
                    ? `/shared-folders/${folder?.id}/notes/${note.id}`
                    : `/folders/${folder?.id}/notes/${note.id}`;
                  return (
                    <ListItem
                      key={note.id}
                      component={RouterLink}
                      to={noteLink}
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
              {!loading && "No notes directly listed for this team."}
            </Typography>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default TeamAssetsView;
