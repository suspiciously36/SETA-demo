import React, { useState, FormEvent, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  CreateTeamReqDto,
  TeamManagerInput,
  TeamMemberInput,
} from "../../types/team.types";
import { DetailedUser, UserRole } from "../../types/user.types";
import { createTeam } from "../../store/actions/teamActions";
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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import SearchIcon from "@mui/icons-material/Search";

import { getInitials } from "../../utils/helpers/getInitials.ts";

import { showSnackbar } from "../../store/actions/notificationActions";

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SelectionTab = "members" | "managers";

const CreateTeamModal: React.FC<CreateTeamModalProps> = ({
  isOpen,
  onClose,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const { creatingLoading, creatingError } = useSelector(
    (state: RootState) => state.teams
  );
  const {
    users: allUsers,
    loading: usersLoading,
    pagination: userListPagination,
  } = useSelector((state: RootState) => state.userList);

  const authUser = useSelector((state: RootState) => state.auth.user);

  const [teamName, setTeamName] = useState("");
  const [selectedManagers, setSelectedManagers] = useState<TeamManagerInput[]>(
    []
  );
  const [selectedMembers, setSelectedMembers] = useState<TeamMemberInput[]>([]);

  const [activeSelectionTab, setActiveSelectionTab] =
    useState<SelectionTab>("members");
  const [searchTerm, setSearchTerm] = useState("");
  const [localFormError, setLocalFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLocalFormError(null);
      const currentTotalUsersInStore = userListPagination?.totalRecords || 0;
      const usersCurrentlyInStore = allUsers?.length || 0;
      const usersToFetch =
        currentTotalUsersInStore > 0 ? currentTotalUsersInStore : 999;

      const typicalPageLimit = 10;
      if (
        !allUsers ||
        usersCurrentlyInStore === 0 ||
        usersCurrentlyInStore < usersToFetch ||
        (usersCurrentlyInStore > typicalPageLimit &&
          userListPagination?.limit === typicalPageLimit)
      ) {
        dispatch(fetchUsers(1, usersToFetch));
      }
    } else {
      resetForm();
    }
  }, [isOpen, dispatch, allUsers, userListPagination, creatingError]);

  const resetForm = () => {
    setTeamName("");
    setSelectedManagers([]);
    setSelectedMembers([]);
    setActiveSelectionTab("members");
    setSearchTerm("");
    setLocalFormError(null);
  };

  const handleActualClose = () => {
    resetForm();
    onClose();
  };

  const handleTabChange = (
    event: React.SyntheticEvent,
    newValue: SelectionTab
  ) => {
    setActiveSelectionTab(newValue);
    setSearchTerm("");
  };

  const handleToggleUser = (user: DetailedUser) => {
    if (activeSelectionTab === "managers") {
      //managers tab
      if (user.role !== UserRole.MANAGER && user.role !== UserRole.ROOT) {
        setLocalFormError(
          `Only users with role 'Manager' or 'Root' can be added as managers.`
        );
        setTimeout(() => setLocalFormError(null), 3000);
        return;
      }
      const existingIndex = selectedManagers.findIndex(
        (m) => m.managerId === user.id
      );
      if (existingIndex > -1) {
        setSelectedManagers(
          selectedManagers.filter((m) => m.managerId !== user.id)
        );
      } else {
        setSelectedManagers([
          ...selectedManagers,
          { managerId: user.id, managerName: user.username },
        ]);
      }
    } else {
      // members tab
      if (user.role !== UserRole.MEMBER) {
        setLocalFormError(
          `Only users with role 'Member' can be added as team members.`
        );
        setTimeout(() => setLocalFormError(null), 3000);
        return;
      }
      const existingIndex = selectedMembers.findIndex(
        (m) => m.memberId === user.id
      );
      if (existingIndex > -1) {
        setSelectedMembers(
          selectedMembers.filter((m) => m.memberId !== user.id)
        );
      } else {
        setSelectedMembers([
          ...selectedMembers,
          { memberId: user.id, memberName: user.username },
        ]);
      }
    }
  };

  const isUserSelected = (user: DetailedUser): boolean => {
    if (activeSelectionTab === "managers") {
      return selectedManagers.some((m) => m.managerId === user.id);
    }
    return selectedMembers.some((m) => m.memberId === user.id);
  };

  const filteredUsers = useMemo(() => {
    if (!allUsers) return [];

    const usersAvailableForSelection = allUsers.filter(
      (user) => user.id !== authUser.id
    );

    let roleFilteredUsers: DetailedUser[];
    if (activeSelectionTab === "managers") {
      roleFilteredUsers = usersAvailableForSelection.filter(
        (user) => user.role === UserRole.MANAGER || user.role === UserRole.ROOT
      );
    } else {
      roleFilteredUsers = allUsers.filter(
        (user) => user.role === UserRole.MEMBER
      );
    }

    if (!searchTerm.trim()) return roleFilteredUsers;

    return roleFilteredUsers.filter(
      (user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allUsers, searchTerm, activeSelectionTab]);

  const handleSelectAllFiltered = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const checked = event.target.checked;
    if (activeSelectionTab === "managers") {
      if (checked) {
        const newManagers = filteredUsers
          .filter(
            (user) => !selectedManagers.some((m) => m.managerId === user.id)
          )
          .map((user) => ({ managerId: user.id, managerName: user.username }));
        setSelectedManagers([...selectedManagers, ...newManagers]);
      } else {
        const filteredUserIds = filteredUsers.map((user) => user.id);
        setSelectedManagers(
          selectedManagers.filter((m) => !filteredUserIds.includes(m.managerId))
        );
      }
    } else {
      if (checked) {
        const newMembers = filteredUsers
          .filter(
            (user) => !selectedMembers.some((m) => m.memberId === user.id)
          )
          .map((user) => ({ memberId: user.id, memberName: user.username }));
        setSelectedMembers([...selectedMembers, ...newMembers]);
      } else {
        const filteredUserIds = filteredUsers.map((user) => user.id);
        setSelectedMembers(
          selectedMembers.filter((m) => !filteredUserIds.includes(m.memberId))
        );
      }
    }
  };

  const selectedFilteredCount = useMemo(() => {
    return filteredUsers.filter((user) => isUserSelected(user)).length;
  }, [filteredUsers, selectedManagers, selectedMembers, activeSelectionTab]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalFormError(null);
    if (!teamName.trim()) {
      setLocalFormError("Team name is required.");
      return;
    }

    const teamData: CreateTeamReqDto = {
      teamName,
      managers: selectedManagers,
      members: selectedMembers,
    };
    try {
      await dispatch(createTeam(teamData));
      dispatch(
        showSnackbar(`Team ${teamName} created successfully.`, "success")
      );
    } catch (error) {
      console.error("Create team failed (caught in component submit):", error);
    }
  };

  const prevCreatingLoading = React.useRef(creatingLoading);
  useEffect(() => {
    if (prevCreatingLoading.current && !creatingLoading && !creatingError) {
      handleActualClose();
    }
    prevCreatingLoading.current = creatingLoading;
  }, [creatingLoading, creatingError, handleActualClose]);

  return (
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
        New team
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
          <CloseIcon />
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
            />
            <Tabs
              value={activeSelectionTab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab
                label={`Add members ${
                  selectedMembers.length > 0
                    ? `(${selectedMembers.length})`
                    : ""
                }`}
                value="members"
                sx={{
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: "0.9rem",
                }}
              />
              <Tab
                label={`Add managers ${
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
                activeSelectionTab === "managers" ? "managers" : "members"
              } by name or email...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
              sx={{ mr: filteredUsers.length > 0 ? 2 : 0 }}
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
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
                    Select all ({filteredUsers.length})
                  </Typography>
                }
                sx={{ whiteSpace: "nowrap" }}
              />
            )}
          </Box>

          <Box
            sx={{ flexGrow: 1, overflowY: "auto", px: { xs: 1, sm: 2 }, pb: 2 }}
          >
            {usersLoading ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="200px"
              >
                <CircularProgress />
              </Box>
            ) : (
              <List dense>
                {filteredUsers.length === 0 && searchTerm && (
                  <Typography
                    sx={{ textAlign: "center", p: 2, color: "text.secondary" }}
                  >
                    No users found matching "{searchTerm}".
                  </Typography>
                )}
                {filteredUsers.length === 0 && !searchTerm && (
                  <Typography
                    sx={{ textAlign: "center", p: 2, color: "text.secondary" }}
                  >
                    {activeSelectionTab === "managers"
                      ? "No potential managers found."
                      : "No potential members found."}
                  </Typography>
                )}
                {filteredUsers.map((user) => (
                  <ListItem
                    key={user.id}
                    button
                    onClick={() => handleToggleUser(user)}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label={isUserSelected(user) ? "remove" : "add"}
                        onClick={() => handleToggleUser(user)}
                      >
                        {isUserSelected(user) ? (
                          <RemoveCircleOutlineIcon color="error" />
                        ) : (
                          <AddIcon color="primary" />
                        )}
                      </IconButton>
                    }
                    sx={{
                      mb: 0.5,
                      borderRadius: "8px",
                      "&:hover": { backgroundColor: "action.hover" },
                      pr: 1,
                    }}
                  >
                    <ListItemAvatar sx={{ minWidth: "auto", mr: 1.5 }}>
                      <Avatar
                        alt={user.username}
                        sx={{ width: 36, height: 36 }}
                      >
                        {getInitials(user.username)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {user.username}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {user.email} - Role: {user.role}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
          {(localFormError || creatingError) && (
            <Box sx={{ px: { xs: 2, sm: 3 }, pb: 1, mt: "auto" }}>
              <Alert severity="error" sx={{ width: "100%" }}>
                {" "}
                {localFormError || creatingError}{" "}
              </Alert>
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
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={creatingLoading}
            sx={{ textTransform: "uppercase" }}
          >
            {creatingLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Create"
            )}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default CreateTeamModal;
