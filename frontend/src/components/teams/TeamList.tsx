// src/components/teams/TeamList.tsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTeams,
  deleteTeam,
  clearTeamDetails,
  createTeam,
} from "../../store/actions/teamActions"; // Added createTeam for typing if needed by modal
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
  Snackbar,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

import { showSnackbar } from "../../store/actions/notificationActions.ts";

const getInitials = (name: string = "") => {
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

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [highlightedTeamId, setHighlightedTeamId] = useState<string | null>(
    null
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const observerRef = useRef<HTMLDivElement | null>(null);
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (
      teams.length === 0 ||
      (pagination && pagination.page !== 1 && currentPage !== 1)
    ) {
      dispatch(fetchTeams(1, ITEMS_PER_PAGE));
      setCurrentPage(1);
    } else if (teams.length === 0 && !loading) {
      dispatch(fetchTeams(1, ITEMS_PER_PAGE));
      setCurrentPage(1);
    }
  }, [dispatch]);

  useEffect(() => {
    if (pagination && pagination.page === 1) {
      setCurrentPage(1);
    }
  }, [pagination]);

  const handleLoadMore = useCallback(() => {
    if (!loading && pagination && teams.length < pagination.totalRecords) {
      const nextPageToFetch = currentPage + 1;
      setIsFetchingMore(true);
      dispatch(fetchTeams(nextPageToFetch, ITEMS_PER_PAGE))
        .then(() => {
          setCurrentPage(nextPageToFetch);
        })
        .catch(() => {
          dispatch(showSnackbar("Failed to load more teams.", "error"));
        })
        .finally(() => {
          setIsFetchingMore(false);
        });
    }
  }, [dispatch, loading, pagination, teams.length, currentPage, showSnackbar]);

  // Setup IntersectionObserver
  useEffect(() => {
    const currentObserverTarget = observerRef.current;
    if (currentObserverTarget) {
      intersectionObserverRef.current = new IntersectionObserver(
        (entries) => {
          if (
            entries[0].isIntersecting &&
            !loading &&
            !isFetchingMore &&
            pagination &&
            teams.length < pagination.totalRecords
          ) {
            console.log("Sentinel visible, loading more teams...");
            handleLoadMore();
          }
        },
        { threshold: 1.0 } // Trigger when 100% of the sentinel is visible
      );
      intersectionObserverRef.current.observe(currentObserverTarget);
    }

    return () => {
      if (intersectionObserverRef.current && currentObserverTarget) {
        intersectionObserverRef.current.unobserve(currentObserverTarget);
      }
    };
  }, [handleLoadMore, loading, isFetchingMore, pagination, teams]); // Re-run if these change

  const handleOpenEditModal = (teamId: string) => {
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
  };

  const handleCardClick = (teamId: string) => {
    setHighlightedTeamId(teamId === highlightedTeamId ? null : teamId);
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

  const canLoadMore =
    pagination && teams && teams.length < pagination.totalRecords;

  return (
    <Box sx={{ p: 3, backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Typography variant="h4" component="h1" sx={{ fontWeight: "bold" }}>
          {" "}
          Team Management{" "}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsCreateModalOpen(true)}
          sx={{
            backgroundColor: "#673ab7",
            "&:hover": { backgroundColor: "#5e35b1" },
            borderRadius: "8px",
            padding: "10px 20px",
            textTransform: "none",
            fontWeight: "bold",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
        >
          {" "}
          New Team{" "}
        </Button>
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
                          ? "2px solid #673ab7"
                          : "2px solid transparent",
                      backgroundColor:
                        team.id === highlightedTeamId ? "#ede7f6" : "#fff",
                      "&:hover": {
                        transform: isDeleting ? "none" : "translateY(-3px)",
                        boxShadow: isDeleting
                          ? "0 4px 12px rgba(0,0,0,0.08)"
                          : "0 6px 16px rgba(0,0,0,0.12)",
                        borderColor: isDeleting
                          ? team.id === highlightedTeamId
                            ? "#673ab7"
                            : "transparent"
                          : team.id === highlightedTeamId
                          ? "#673ab7"
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
                                  ? "#5e35b1"
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
                                  <CircularProgress size={16} color="inherit" />
                                ) : (
                                  <DeleteIcon
                                    fontSize="small"
                                    sx={{ color: "indianred" }}
                                  />
                                )}
                              </IconButton>
                            </span>
                          </Tooltip>
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
      {/* Sentinel element for IntersectionObserver */}
      {canLoadMore && !isFetchingMore && !loading && (
        <div ref={observerRef} style={{ height: "1px", marginTop: "20px" }} />
      )}
      {/* Loading indicator for when fetching more items via scroll */}
      {(isFetchingMore ||
        (loading && teams && teams.length > 0 && currentPage > 1)) && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4, mb: 2 }}>
          <CircularProgress />
        </Box>
      )}
      <CreateTeamModal
        isOpen={isCreateModalOpen}
        onClose={handleCreateModalClose}
      />{" "}
      {/* Updated onClose */}
      <EditTeamModal
        isOpen={!!editingTeamId}
        onClose={handleCloseEditModal}
        teamIdToEdit={editingTeamId}
      />
    </Box>
  );
};

export default TeamList;
