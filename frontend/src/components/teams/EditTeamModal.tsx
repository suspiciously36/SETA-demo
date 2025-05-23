import React, {
  useState,
  FormEvent,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { UpdateTeamDto, DetailedTeam } from "../../types/team.types";
import { DetailedUser, UserRole } from "../../types/user.types";
import {
  submitTeamUpdate,
  fetchTeamForEdit,
  clearTeamDetails,
} from "../../store/actions/teamActions";
import { fetchUsers } from "../../store/actions/userListActions";
import { RootState, AppDispatch } from "../../store";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Checkbox,
  InputAdornment,
  FormControlLabel,
  Switch,
  ListItemIcon,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import SearchIcon from "@mui/icons-material/Search";
import { showSnackbar } from "../../store/actions/notificationActions";

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

interface EditTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamIdToEdit: string | null;
}
type SelectionTab = "members" | "managers";
interface ModalSelectedManager {
  userId: string;
  userName: string;
  isMain: boolean;
}

const EditTeamModal: React.FC<EditTeamModalProps> = ({
  isOpen,
  onClose,
  teamIdToEdit,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const {
    currentTeamDetails,
    loadingDetails,
    errorDetails,
    updatingLoading,
    updatingError,
  } = useSelector((state: RootState) => state.teams);
  const {
    users: allUsers,
    loading: usersLoading,
    pagination: userListPagination,
  } = useSelector((state: RootState) => state.userList);
  const authUser = useSelector((state: RootState) => state.auth.user);

  const [teamName, setTeamName] = useState("");
  const [nameAtSubmit, setNameAtSubmit] = useState("");
  const [selectedManagers, setSelectedManagers] = useState<
    ModalSelectedManager[]
  >([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [activeSelectionTab, setActiveSelectionTab] =
    useState<SelectionTab>("members");
  const [searchTerm, setSearchTerm] = useState("");
  const [localFormError, setLocalFormError] = useState<string | null>(null);
  const [isUserAllowedToEdit, setIsUserAllowedToEdit] = useState(false);

  const resetFormStates = useCallback(() => {
    setTeamName("");
    setNameAtSubmit(""); // Reset name at submit
    setSelectedManagers([]);
    setSelectedMemberIds([]);
    setActiveSelectionTab("members");
    setSearchTerm("");
    setLocalFormError(null);
    setIsUserAllowedToEdit(false);
  }, []);

  const handleActualClose = useCallback(() => {
    resetFormStates();
    dispatch(clearTeamDetails());
    onClose();
  }, [onClose, resetFormStates, dispatch]);

  useEffect(() => {
    if (isOpen && teamIdToEdit) {
      dispatch(fetchTeamForEdit(teamIdToEdit));
      const currentTotalUsersInStore = userListPagination?.totalRecords || 0;
      const usersCurrentlyInStore = allUsers?.length || 0;
      const desiredUserFetchLimit =
        currentTotalUsersInStore > 0 ? currentTotalUsersInStore : 999;
      const typicalPageLimit = 10;
      if (
        !allUsers ||
        usersCurrentlyInStore === 0 ||
        usersCurrentlyInStore < desiredUserFetchLimit ||
        (usersCurrentlyInStore > typicalPageLimit &&
          userListPagination?.limit === typicalPageLimit)
      ) {
        dispatch(fetchUsers(1, desiredUserFetchLimit));
      }
    }
  }, [isOpen, teamIdToEdit, dispatch, allUsers, userListPagination]);

  useEffect(() => {
    if (currentTeamDetails && teamIdToEdit === currentTeamDetails.id) {
      const currentNameFromDetails =
        currentTeamDetails.team_name || currentTeamDetails.name || "";
      setTeamName(currentNameFromDetails);
      // setNameAtSubmit(currentNameFromDetails); // Set initial name for snackbar if needed before any edit
      const initialManagers: ModalSelectedManager[] =
        currentTeamDetails.managers.map((m) => ({
          userId: m.userId,
          userName: m.username,
          isMain: m.isMain,
        }));
      setSelectedManagers(initialManagers);
      const initialMemberIds: string[] = currentTeamDetails.members.map(
        (m) => m.userId
      );
      setSelectedMemberIds(initialMemberIds);
      const isRoot = authUser?.role === UserRole.ROOT;
      const isMainManagerOfThisTeam = initialManagers.some(
        (m) => m.userId === authUser?.id && m.isMain
      );
      const canEdit = isRoot || isMainManagerOfThisTeam;
      setIsUserAllowedToEdit(canEdit);
      if (!canEdit) {
        setLocalFormError("You are not authorized to edit this team.");
      } else {
        setLocalFormError(null);
      }
    } else {
      if (isOpen && teamIdToEdit && !loadingDetails && !currentTeamDetails) {
        resetFormStates();
      }
    }
  }, [
    currentTeamDetails,
    teamIdToEdit,
    authUser,
    isOpen,
    loadingDetails,
    resetFormStates,
  ]);

  const handleTabChange = (
    event: React.SyntheticEvent,
    newValue: SelectionTab
  ) => {
    setActiveSelectionTab(newValue);
    setSearchTerm("");
  };
  const handleToggleManager = (user: DetailedUser) => {
    /* ... (same logic) ... */
    setLocalFormError(null);
    const existingManagerIndex = selectedManagers.findIndex(
      (m) => m.userId === user.id
    );
    if (existingManagerIndex > -1) {
      const currentMain = selectedManagers[existingManagerIndex];
      if (
        currentMain.isMain &&
        selectedManagers.filter((m) => m.isMain).length === 1
      ) {
        setLocalFormError(
          "Cannot remove the only main manager. Assign another main manager first."
        );
        setTimeout(() => setLocalFormError(null), 4000);
        return;
      }
      setSelectedManagers(selectedManagers.filter((m) => m.userId !== user.id));
    } else {
      if (user.role === UserRole.MANAGER || user.role === UserRole.ROOT) {
        setSelectedManagers([
          ...selectedManagers,
          { userId: user.id, userName: user.username, isMain: false },
        ]);
      } else {
        setLocalFormError(
          "Only Manager or Root users can be added as managers."
        );
        setTimeout(() => setLocalFormError(null), 3000);
      }
    }
  };
  const handleToggleMember = (user: DetailedUser) => {
    /* ... (same logic) ... */
    setLocalFormError(null);
    if (selectedMemberIds.includes(user.id)) {
      setSelectedMemberIds(selectedMemberIds.filter((id) => id !== user.id));
    } else {
      if (user.role === UserRole.MEMBER) {
        setSelectedMemberIds([...selectedMemberIds, user.id]);
      } else {
        setLocalFormError(
          "Only users with role 'Member' can be added as team members."
        );
        setTimeout(() => setLocalFormError(null), 3000);
      }
    }
  };
  const handleSetMainManager = (managerUserIdToSetAsMain: string) => {
    /* ... (same logic) ... */
    setLocalFormError(null);
    const currentMainManagers = selectedManagers.filter((m) => m.isMain);
    if (
      authUser?.id === managerUserIdToSetAsMain &&
      currentMainManagers.length === 1 &&
      currentMainManagers[0].userId === authUser.id &&
      !selectedManagers.find((m) => m.userId === managerUserIdToSetAsMain)
        ?.isMain
    ) {
      setLocalFormError("You cannot unset yourself as the only main manager.");
      setTimeout(() => setLocalFormError(null), 4000);
      return;
    }
    setSelectedManagers(
      selectedManagers.map((m) => ({
        ...m,
        isMain: m.userId === managerUserIdToSetAsMain,
      }))
    );
  };
  const isUserManagerSelected = (user: DetailedUser): boolean =>
    selectedManagers.some((m) => m.userId === user.id);
  const isUserMemberSelected = (user: DetailedUser): boolean =>
    selectedMemberIds.includes(user.id);
  const filteredUsers = useMemo(() => {
    /* ... (same as before) ... */
    if (!allUsers) return [];
    const usersAvailableForSelection = allUsers.filter(
      (user) => user.id !== authUser?.id
    );
    let roleFilteredUsers: DetailedUser[];
    if (activeSelectionTab === "managers") {
      roleFilteredUsers = usersAvailableForSelection.filter(
        (user) => user.role === UserRole.MANAGER || user.role === UserRole.ROOT
      );
    } else {
      roleFilteredUsers = usersAvailableForSelection.filter(
        (user) => user.role === UserRole.MEMBER
      );
    }
    if (!searchTerm.trim()) return roleFilteredUsers;
    return roleFilteredUsers.filter(
      (user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allUsers, searchTerm, activeSelectionTab, authUser]);
  const handleSelectAllFiltered = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    /* ... (same as before) ... */
    const checked = event.target.checked;
    if (activeSelectionTab === "managers") {
      const currentSelectedManagerIds = new Set(
        selectedManagers.map((m) => m.userId)
      );
      let newSelectedManagers = [...selectedManagers];
      filteredUsers.forEach((user) => {
        if (checked) {
          if (
            !currentSelectedManagerIds.has(user.id) &&
            (user.role === UserRole.MANAGER || user.role === UserRole.ROOT)
          ) {
            newSelectedManagers.push({
              userId: user.id,
              userName: user.username,
              isMain: false,
            });
          }
        } else {
          newSelectedManagers = newSelectedManagers.filter(
            (m) => m.userId !== user.id
          );
        }
      });
      setSelectedManagers(newSelectedManagers);
    } else {
      const newSelectedMemberIds = new Set(selectedMemberIds);
      filteredUsers.forEach((user) => {
        if (user.role === UserRole.MEMBER) {
          if (checked) {
            newSelectedMemberIds.add(user.id);
          } else {
            newSelectedMemberIds.delete(user.id);
          }
        }
      });
      setSelectedMemberIds(Array.from(newSelectedMemberIds));
    }
  };
  const selectedFilteredCount = useMemo(() => {
    /* ... (same as before) ... */
    if (activeSelectionTab === "managers") {
      return filteredUsers.filter((user) =>
        selectedManagers.some((m) => m.userId === user.id)
      ).length;
    }
    return filteredUsers.filter((user) => selectedMemberIds.includes(user.id))
      .length;
  }, [filteredUsers, selectedManagers, selectedMemberIds, activeSelectionTab]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isUserAllowedToEdit) {
      setLocalFormError("You are not authorized to submit changes.");
      return;
    }
    setLocalFormError(null);
    if (!teamIdToEdit) {
      setLocalFormError("Team ID is missing.");
      return;
    }
    if (!teamName.trim()) {
      setLocalFormError("Team name is required.");
      return;
    }
    const hasMainManager = selectedManagers.some((m) => m.isMain);
    if (selectedManagers.length > 0 && !hasMainManager) {
      setLocalFormError(
        "At least one manager must be designated as the main manager."
      );
      return;
    }
    if (selectedManagers.length === 0 && selectedMemberIds.length === 0) {
      setLocalFormError("A team must have at least one manager or member.");
      return;
    }

    setNameAtSubmit(teamName); // Capture the name at submission time for the snackbar

    const originalTeamName =
      currentTeamDetails?.team_name || currentTeamDetails?.name || "";
    const updateDto: UpdateTeamDto = {
      teamName: teamName !== originalTeamName ? teamName : undefined,
      managers: selectedManagers.map((m) => ({
        userId: m.userId,
        isMain: m.isMain,
      })),
      members: selectedMemberIds,
    };

    // Dispatch the action. The useEffect watching updatingLoading/updatingError will handle UI.
    dispatch(submitTeamUpdate(teamIdToEdit, updateDto));
  };

  const prevUpdatingLoading = React.useRef(updatingLoading);
  useEffect(() => {
    if (prevUpdatingLoading.current === true && updatingLoading === false) {
      // Check for transition from true to false
      if (updatingError) {
        dispatch(
          showSnackbar(`Error updating team: ${updatingError}`, "error")
        );
      } else {
        // Use nameAtSubmit for the success message, or fallback to currentTeamDetails.team_name if teamName state was reset early
        dispatch(
          showSnackbar(
            `Team "${
              nameAtSubmit || currentTeamDetails?.team_name || "Team"
            }" updated successfully!`,
            "success"
          )
        );
        handleActualClose();
      }
    }
    prevUpdatingLoading.current = updatingLoading;
  }, [
    updatingLoading,
    updatingError,
    showSnackbar,
    handleActualClose,
    nameAtSubmit,
    currentTeamDetails,
  ]);

  const handleCloseSnackbar = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  if (!isOpen) return null;
  if (loadingDetails) {
    return (
      <Dialog
        open={isOpen}
        onClose={handleActualClose}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: "12px", p: 3 } }}
      >
        {" "}
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="300px"
        >
          {" "}
          <CircularProgress />{" "}
          <Typography sx={{ ml: 2 }}>Loading team details...</Typography>{" "}
        </Box>{" "}
      </Dialog>
    );
  }
  if (errorDetails && !currentTeamDetails) {
    return (
      <Dialog
        open={isOpen}
        onClose={handleActualClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "12px", p: 3 } }}
      >
        {" "}
        <Alert severity="error">
          {" "}
          Failed to load team details: {errorDetails}{" "}
        </Alert>{" "}
        <DialogActions>
          <Button onClick={handleActualClose}>Close</Button>
        </DialogActions>{" "}
      </Dialog>
    );
  }
  if (teamIdToEdit && !currentTeamDetails && !loadingDetails && !errorDetails) {
    return (
      <Dialog
        open={isOpen}
        onClose={handleActualClose}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: "12px", p: 3 } }}
      >
        {" "}
        <Typography>Waiting for team data or team not found...</Typography>{" "}
      </Dialog>
    );
  }

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={handleActualClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "12px",
            height: "calc(100% - 64px)",
            maxHeight: "700px",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 2,
            fontWeight: "bold",
            fontSize: "1.5rem",
            borderBottom: "1px solid #eee",
          }}
        >
          {" "}
          Edit team:{" "}
          {currentTeamDetails?.team_name || currentTeamDetails?.name || ""}
          <IconButton
            aria-label="close"
            onClick={handleActualClose}
            sx={{
              position: "absolute",
              right: 12,
              top: 12,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            {" "}
            <CloseIcon />{" "}
          </IconButton>
        </DialogTitle>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            overflow: "hidden",
          }}
        >
          <DialogContent
            sx={{
              flexGrow: 1,
              p: 0,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2, pb: 1 }}>
              <TextField
                autoFocus
                margin="dense"
                id="teamName"
                label="Team name"
                type="text"
                fullWidth
                variant="outlined"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                required
                sx={{ mb: 2 }}
                disabled={!isUserAllowedToEdit}
              />
              <Tabs
                value={activeSelectionTab}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
              >
                <Tab
                  label={`Members ${
                    selectedMemberIds.length > 0
                      ? `(${selectedMemberIds.length})`
                      : ""
                  }`}
                  value="members"
                  sx={{
                    textTransform: "none",
                    fontWeight: 500,
                    fontSize: "0.9rem",
                  }}
                  disabled={!isUserAllowedToEdit}
                />
                <Tab
                  label={`Managers ${
                    selectedManagers.length > 0
                      ? `(${selectedManagers.length})`
                      : ""
                  }`}
                  value="managers"
                  sx={{
                    textTransform: "none",
                    fontWeight: 500,
                    fontSize: "0.9rem",
                  }}
                  disabled={!isUserAllowedToEdit}
                />
              </Tabs>
            </Box>
            <Box
              sx={{
                px: { xs: 2, sm: 3 },
                py: 1,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <TextField
                fullWidth
                variant="outlined"
                placeholder={`Search ${
                  activeSelectionTab === "managers"
                    ? "potential managers"
                    : "potential members"
                }...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {" "}
                      <SearchIcon />{" "}
                    </InputAdornment>
                  ),
                }}
                size="small"
                sx={{ mr: filteredUsers.length > 0 ? 2 : 0 }}
                disabled={!isUserAllowedToEdit}
              />
              {filteredUsers.length > 0 && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={
                        filteredUsers.length > 0 &&
                        selectedFilteredCount === filteredUsers.length
                      }
                      indeterminate={
                        selectedFilteredCount > 0 &&
                        selectedFilteredCount < filteredUsers.length
                      }
                      onChange={handleSelectAllFiltered}
                      size="small"
                      disabled={!isUserAllowedToEdit}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
                      {" "}
                      Select all ({filteredUsers.length}){" "}
                    </Typography>
                  }
                  sx={{ whiteSpace: "nowrap" }}
                />
              )}
            </Box>
            <Box
              sx={{
                flexGrow: 1,
                overflowY: "auto",
                px: { xs: 1, sm: 2 },
                pb: 2,
              }}
            >
              {usersLoading ? (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height="200px"
                >
                  {" "}
                  <CircularProgress />{" "}
                </Box>
              ) : (
                <List dense>
                  {filteredUsers.length === 0 && searchTerm && (
                    <Typography
                      sx={{
                        textAlign: "center",
                        p: 2,
                        color: "text.secondary",
                      }}
                    >
                      {" "}
                      No users found matching "{searchTerm}".{" "}
                    </Typography>
                  )}
                  {filteredUsers.length === 0 && !searchTerm && (
                    <Typography
                      sx={{
                        textAlign: "center",
                        p: 2,
                        color: "text.secondary",
                      }}
                    >
                      {" "}
                      {activeSelectionTab === "managers"
                        ? "No other managers to select."
                        : "No other members to select."}{" "}
                    </Typography>
                  )}
                  {filteredUsers.map((user) => {
                    const isSelectedCurrently =
                      activeSelectionTab === "managers"
                        ? isUserManagerSelected(user)
                        : isUserMemberSelected(user);
                    const currentManagerData =
                      activeSelectionTab === "managers"
                        ? selectedManagers.find((m) => m.userId === user.id)
                        : undefined;
                    return (
                      <ListItem
                        key={user.id}
                        button
                        onClick={() =>
                          isUserAllowedToEdit &&
                          (activeSelectionTab === "managers"
                            ? handleToggleManager(user)
                            : handleToggleMember(user))
                        }
                        disabled={!isUserAllowedToEdit && !isSelectedCurrently}
                        sx={{
                          mb: 0.5,
                          borderRadius: "8px",
                          "&:hover": { backgroundColor: "action.hover" },
                          pr: 1,
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: "auto", mr: 1 }}>
                          {" "}
                          <Checkbox
                            edge="start"
                            checked={isSelectedCurrently}
                            tabIndex={-1}
                            disableRipple
                            disabled={
                              !isUserAllowedToEdit && !isSelectedCurrently
                            }
                          />{" "}
                        </ListItemIcon>
                        <ListItemAvatar sx={{ minWidth: "auto", mr: 1.5 }}>
                          {" "}
                          <Avatar
                            alt={user.username}
                            sx={{ width: 36, height: 36 }}
                            src={user.avatarUrl}
                          >
                            {getInitials(user.username)}
                          </Avatar>{" "}
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
                              {" "}
                              {user.username}{" "}
                            </Typography>
                          }
                          secondary={
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {" "}
                              {user.email} - Role: {user.role}{" "}
                            </Typography>
                          }
                        />
                        {activeSelectionTab === "managers" &&
                          isSelectedCurrently &&
                          currentManagerData && (
                            <Tooltip
                              title={
                                currentManagerData.isMain
                                  ? "Main Manager"
                                  : "Set as Main Manager"
                              }
                            >
                              {" "}
                              <Box
                                onClick={(e) => e.stopPropagation()}
                                sx={{ ml: 1 }}
                              >
                                {" "}
                                <Switch
                                  size="small"
                                  checked={currentManagerData.isMain}
                                  onChange={() =>
                                    isUserAllowedToEdit &&
                                    handleSetMainManager(user.id)
                                  }
                                  disabled={!isUserAllowedToEdit}
                                />{" "}
                              </Box>{" "}
                            </Tooltip>
                          )}
                        <IconButton
                          edge="end"
                          aria-label={isSelectedCurrently ? "remove" : "add"}
                          disabled={
                            !isUserAllowedToEdit && !isSelectedCurrently
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            isUserAllowedToEdit &&
                              (activeSelectionTab === "managers"
                                ? handleToggleManager(user)
                                : handleToggleMember(user));
                          }}
                        >
                          {" "}
                          {isSelectedCurrently ? (
                            <RemoveCircleOutlineIcon color="error" />
                          ) : (
                            <AddIcon color="primary" />
                          )}{" "}
                        </IconButton>
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </Box>
            {(localFormError || (updatingError && !updatingLoading)) && (
              <Box sx={{ px: { xs: 2, sm: 3 }, pb: 1, mt: "auto" }}>
                {" "}
                <Alert severity="error" sx={{ width: "100%" }}>
                  {" "}
                  {localFormError || updatingError}{" "}
                </Alert>{" "}
              </Box>
            )}
          </DialogContent>
          <DialogActions
            sx={{
              p: "12px 24px",
              borderTop: "1px solid #eee",
              backgroundColor: "background.paper",
            }}
          >
            <Button
              onClick={handleActualClose}
              variant="outlined"
              color="inherit"
              sx={{ textTransform: "uppercase" }}
            >
              {" "}
              Cancel{" "}
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={updatingLoading || !isUserAllowedToEdit}
              sx={{ textTransform: "uppercase" }}
            >
              {" "}
              {updatingLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Save Changes"
              )}{" "}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
};

export default EditTeamModal;
