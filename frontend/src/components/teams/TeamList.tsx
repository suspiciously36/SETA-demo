import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTeams,
  deleteTeam,
  clearTeamDetails,
} from "../../store/actions/teamActions";
import { RootState, AppDispatch } from "../../store";
import { Team } from "../../types/team.types";
import CreateTeamModal from "./CreateTeamModal";
import EditTeamModal from "./EditTeamModal";

import {
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
  Avatar,
  AvatarGroup,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

import { showSnackbar } from "../../store/actions/notificationActions.ts";
import { UserRole } from "../../types/user.types.ts";

import { getInitials } from "../../utils/helpers/getInitials.ts";
import { useNavigate } from "react-router-dom";

const ITEMS_PER_PAGE = 10;

const TeamList: React.FC = () => {
  const rainbowColors = [
    "#FF1744", // Red
    "#FF9100", // Orange
    "#FFEA00", // Yellow
    "#00E676", // Green
    "#00B0FF", // Blue
    "#651FFF", // Indigo
    "#D500F9", // Violet
  ];

  const dispatch: AppDispatch = useDispatch();
  const { teams, loading, error, pagination, deletingLoading, deletingError } =
    useSelector((state: RootState) => state.teams);

  const users = useSelector((state: RootState) => state.userList.users);

  const navigate = useNavigate();

  const loggedInUser = useSelector((state: RootState) => state.auth.user);

  const canDeleteTeams = loggedInUser?.role === UserRole.ROOT;

  const canManageTeams =
    loggedInUser?.role === UserRole.ROOT ||
    loggedInUser?.role === UserRole.MANAGER;

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [highlightedTeamId, setHighlightedTeamId] = useState<string | null>(
    null
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  const fetchNextPage = useCallback(async () => {
    if (
      !isFetchingMore &&
      !loading &&
      pagination &&
      pagination.currentPage < pagination.totalPages
    ) {
      setIsFetchingMore(true);
      dispatch(fetchTeams(pagination.currentPage + 1, ITEMS_PER_PAGE)).finally(
        () => setIsFetchingMore(false)
      );
    }
  }, [dispatch, isFetchingMore, loading, pagination]);

  useEffect(() => {
    if (!sentinelRef.current) return;

    observer.current?.disconnect();

    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      {
        root: null,
        rootMargin: "100px",
        threshold: 1.0,
      }
    );

    observer.current.observe(sentinelRef.current);

    return () => observer.current?.disconnect();
  }, [fetchNextPage]);

  useEffect(() => {
    if (
      teams.length === 0 ||
      (pagination && pagination.currentPage !== 1 && currentPage !== 1)
    ) {
      dispatch(fetchTeams(1, ITEMS_PER_PAGE));
      setCurrentPage(1);
    }
  }, [dispatch]);

  const handleOpenEditModal = (teamId: string) => {
    if (!canManageTeams) return;
    setEditingTeamId(teamId);
  };

  const handleCloseEditModal = () => {
    setEditingTeamId(null);
    dispatch(clearTeamDetails());
  };

  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false);
  };

  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    if (canManageTeams) {
      if (
        window.confirm(
          `Are you sure you want to delete the team "${teamName}"? This action cannot be undone.`
        )
      ) {
        try {
          await dispatch(deleteTeam(teamId, currentPage, ITEMS_PER_PAGE));
          dispatch(
            showSnackbar(`Team "${teamName}" deleted successfully.`, "success")
          );
          const newTotalRecords = pagination ? pagination.totalRecords - 1 : 0;
          const newTotalPages = Math.ceil(newTotalRecords / ITEMS_PER_PAGE);
          if (currentPage > newTotalPages && newTotalPages > 0) {
            setCurrentPage(newTotalPages);
          } else if (newTotalRecords === 0) {
            setCurrentPage(1);
          }
        } catch (e: any) {
          console.error("Delete team failed (caught in component):", e);
          dispatch(
            showSnackbar(
              e.message || `Failed to delete team "${teamName}".`,
              "error"
            )
          );
        }
      }
    }
  };

  const handleCardClick = (teamId: string) => {
    const isManagerOfTeam = users.some(
      (user) =>
        user.id === loggedInUser?.id &&
        (user.role === UserRole.MANAGER || user.role === UserRole.ROOT) &&
        user.teams.some((team) => team.id === teamId)
    );
    if (loggedInUser?.role === UserRole.ROOT) {
      navigate(`/teams/${teamId}/assets`);
      return true;
    }
    if (!isManagerOfTeam) {
      dispatch(
        showSnackbar(
          "You do not have permission to view team assets.",
          "warning"
        )
      );
      return;
    }
    navigate(`/teams/${teamId}/assets`);
  };

  if (loading && currentPage === 1 && (!teams || teams.length === 0)) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        {" "}
        <CircularProgress />{" "}
        <Typography sx={{ ml: 2 }}>Loading teams...</Typography>{" "}
      </Box>
    );
  }

  if (error && (!teams || teams.length === 0) && currentPage === 1) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Error fetching teams: {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Typography
          variant="h4"
          component="h2"
          sx={{ fontWeight: "400", color: "#666" }}
        >
          {" "}
          Team Management{" "}
        </Typography>
        {canManageTeams && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsCreateModalOpen(true)}
            sx={{
              backgroundColor: "#fff",
              "&:hover": {
                backgroundColor: "rgba(48, 112, 196, 0.95)",
                color: "#fff",
              },
              border: "1.5px solid rgba(48, 112, 196, 0.95)",
              borderRadius: "24px",
              minWidth: "120px",
              padding: "10px 20px",
              textTransform: "none",
              fontWeight: "bold",
              fontSize: "16px",
              color: "rgba(48, 112, 196, 0.95)",
            }}
          >
            NEW TEAM
          </Button>
        )}
      </Box>
      {(!teams || teams.length === 0) && !loading && !error ? (
        <Alert severity="info" sx={{ m: 2 }}>
          No teams found. Click "New Team" to add one!
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {teams &&
            teams.map((team: Team) => {
              const isDeleting = deletingLoading && deletingLoading[team.id];
              const deleteErrorForThisTeam =
                deletingError && deletingError[team.id];
              return (
                <Grid item xs={12} sm={6} md={4} lg={4} xl={4} key={team.id}>
                  <Card
                    onClick={() => !isDeleting && handleCardClick(team.id)}
                    sx={{
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                      cursor: isDeleting ? "default" : "pointer",
                      opacity: isDeleting ? 0.7 : 1,
                      transition:
                        "box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out, border-color 0.2s ease-in-out, opacity 0.2s ease-in-out",
                      border:
                        team.id === highlightedTeamId
                          ? "2px solid rgba(48, 112, 196, 0.95)"
                          : "2px solid transparent",
                      backgroundColor:
                        team.id === highlightedTeamId
                          ? "rgba(159, 183, 214, 0.45)"
                          : "#fff",
                      "&:hover": {
                        transform: isDeleting ? "none" : "translateY(-3px)",
                        boxShadow: isDeleting
                          ? "0 4px 12px rgba(0,0,0,0.08)"
                          : "0 6px 16px rgba(0,0,0,0.12)",
                        borderColor: isDeleting
                          ? team.id === highlightedTeamId
                            ? "rgba(48, 112, 196, 0.95)"
                            : "transparent"
                          : team.id === highlightedTeamId
                          ? "rgba(48, 112, 196, 0.95)"
                          : "#bdbdbd",
                      },
                    }}
                  >
                    <CardContent
                      sx={{
                        flexGrow: 1,
                        p: 2,
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={1.5}
                      >
                        <Box
                          sx={{
                            flexGrow: 1,
                            minWidth: 0,
                            pr: 1,
                            overflow: "hidden",
                          }}
                        >
                          <Typography
                            variant="h6"
                            component="div"
                            title={team.team_name}
                            sx={{
                              fontWeight: "bold",
                              color:
                                team.id === highlightedTeamId
                                  ? "rgba(48, 112, 196, 0.95)"
                                  : "text.primary",
                              fontSize: "1.1rem",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              width: "100%",
                            }}
                          >
                            {team.team_name}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            flexShrink: 0,
                          }}
                        >
                          {canManageTeams && (
                            <Tooltip title="Edit Team">
                              <span>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEditModal(team.id);
                                  }}
                                  disabled={isDeleting}
                                  sx={{
                                    color:
                                      team.id === highlightedTeamId
                                        ? "#5e35b1"
                                        : "text.secondary",
                                    "&:hover": {
                                      backgroundColor: "action.hover",
                                    },
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                          {canDeleteTeams && (
                            <Tooltip
                              title={isDeleting ? "Deleting..." : "Delete Team"}
                            >
                              <span>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteTeam(
                                      team.id,
                                      team.team_name || "Unknown Team"
                                    );
                                  }}
                                  disabled={isDeleting}
                                  sx={{
                                    color:
                                      team.id === highlightedTeamId
                                        ? "#5e35b1"
                                        : "text.secondary",
                                    "&:hover": {
                                      backgroundColor: "action.hover",
                                    },
                                  }}
                                >
                                  {isDeleting ? (
                                    <CircularProgress
                                      size={16}
                                      color="inherit"
                                    />
                                  ) : (
                                    <DeleteIcon
                                      fontSize="small"
                                      sx={{ color: "indianred" }}
                                    />
                                  )}
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                        </Box>
                      </Box>
                      {deleteErrorForThisTeam && (
                        <Alert
                          severity="error"
                          variant="outlined"
                          sx={{ fontSize: "0.75rem", p: "0px 8px", mb: 1 }}
                        >
                          {" "}
                          {deleteErrorForThisTeam}{" "}
                        </Alert>
                      )}
                      <Box
                        sx={{
                          flexGrow: 1,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-around",
                        }}
                      >
                        <Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1, fontSize: "1.2rem" }}
                          >
                            {" "}
                            {(team as any).total_members}{" "}
                            {team.total_members <= 1 ? "member" : "members"}{" "}
                          </Typography>
                          <AvatarGroup
                            max={7}
                            sx={{ justifyContent: "flex-end", mb: 1.5 }}
                            spacing="small"
                          >
                            {Array.from({ length: team.total_members }).map(
                              (_, idx) => (
                                <Avatar
                                  key={idx}
                                  sx={{
                                    bgcolor:
                                      rainbowColors[idx % rainbowColors.length],
                                    width: 40,
                                    height: 40,
                                    fontSize: "1rem",
                                  }}
                                >
                                  {getInitials()}
                                </Avatar>
                              )
                            )}
                          </AvatarGroup>
                        </Box>
                        <Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1, fontSize: "1.2rem" }}
                          >
                            {" "}
                            {(team as any).total_managers}{" "}
                            {team.total_managers <= 1 ? "manager" : "managers"}{" "}
                          </Typography>
                          <AvatarGroup
                            max={5}
                            sx={{ justifyContent: "flex-end" }}
                            spacing="small"
                          >
                            {Array.from({ length: team.total_managers }).map(
                              (_, idx) => (
                                <Avatar
                                  key={idx}
                                  sx={{
                                    bgcolor:
                                      rainbowColors[idx % rainbowColors.length],
                                    width: 40,
                                    height: 40,
                                    fontSize: "1.2rem",
                                  }}
                                >
                                  {getInitials()}
                                </Avatar>
                              )
                            )}
                          </AvatarGroup>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
        </Grid>
      )}
      {pagination && pagination.currentPage < pagination.totalPages && (
        <Box
          ref={sentinelRef}
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 4,
          }}
        >
          <CircularProgress />
        </Box>
      )}
      <CreateTeamModal
        isOpen={isCreateModalOpen}
        onClose={handleCreateModalClose}
      />{" "}
      <EditTeamModal
        isOpen={!!editingTeamId}
        onClose={handleCloseEditModal}
        teamIdToEdit={editingTeamId}
      />
    </Box>
  );
};

export default TeamList;
