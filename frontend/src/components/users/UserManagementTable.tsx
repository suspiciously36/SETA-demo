// src/components/users/UserManagementTable.tsx
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteUser, fetchUsers } from "../../store/actions/userListActions";
import { RootState, AppDispatch } from "../../store";
import {
  DetailedUser,
  UserRole,
  UserAssociatedTeamInfo,
} from "../../types/user.types";

import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Avatar,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Button,
  Snackbar,
  TablePagination,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CreateUserModal from "./CreateUserModal.tsx";

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

const chipColorPalette = [
  { backgroundColor: "#e3f2fd", color: "#1565c0" },
  { backgroundColor: "#e8f5e9", color: "#2e7d32" },
  { backgroundColor: "#fff3e0", color: "#ef6c00" },
  { backgroundColor: "#f3e5f5", color: "#6a1b9a" },
  { backgroundColor: "#ffebee", color: "#c62828" },
  { backgroundColor: "#e0f7fa", color: "#006064" },
  { backgroundColor: "#f9fbe7", color: "#9e9d24" },
];

const getTeamChipStyle = (teamNameOrId: string) => {
  let hash = 0;
  for (let i = 0; i < teamNameOrId.length; i++) {
    const char = teamNameOrId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  const index = Math.abs(hash) % chipColorPalette.length;
  return chipColorPalette[index];
};

const UserManagementTable: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { users, loading, error, pagination } = useSelector(
    (state: RootState) => state.userList
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [selected, setSelected] = useState<readonly string[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [currentUserActions, setCurrentUserActions] =
    useState<DetailedUser | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    dispatch(fetchUsers(currentPage, rowsPerPage));
  }, [dispatch, currentPage, rowsPerPage]);

  const handlePageChange = (event: unknown, newPage: number) => {
    setCurrentPage(newPage + 1);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = users.map((n) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (
    event: React.MouseEvent<HTMLInputElement>,
    id: string
  ) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: readonly string[] = [];
    if (selectedIndex === -1) newSelected = newSelected.concat(selected, id);
    else if (selectedIndex === 0)
      newSelected = newSelected.concat(selected.slice(1));
    else if (selectedIndex === selected.length - 1)
      newSelected = newSelected.concat(selected.slice(0, -1));
    else if (selectedIndex > 0)
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    setSelected(newSelected);
  };

  const isSelected = (id: string) => selected.indexOf(id) !== -1;
  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    user: DetailedUser
  ) => {
    setAnchorEl(event.currentTarget);
    setCurrentUserActions(user);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentUserActions(null);
  };
  const handleViewProfile = () => {
    if (currentUserActions) console.log("View profile:", currentUserActions.id);
    handleMenuClose();
  };
  const handlePermissions = () => {
    if (currentUserActions) console.log("Permissions:", currentUserActions.id);
    handleMenuClose();
  };
  const handleDeleteUser = async (userId: string) => {
    if (currentUserActions) {
      console.log(userId);
      if (
        window.confirm(
          "Are you sure to delete this user? The action cannot be undone."
        )
      ) {
        try {
          await dispatch(deleteUser(userId, currentPage, rowsPerPage));
          dispatch(showSnackbar(`User deleted successfully.`, "success"));
          if (users.length === 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
          }
        } catch (e: any) {
          console.error("Delete user failed (caught in component):", e);
          dispatch(
            showSnackbar(e.message || `Failed to delete user.`, "error")
          );
        }
      }
    }
    handleMenuClose();
  };

  if (loading)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="300px"
      >
        <CircularProgress />{" "}
        <Typography sx={{ ml: 2 }}>Loading users...</Typography>
      </Box>
    );
  if (error)
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Error fetching users: {error}
      </Alert>
    );

  return (
    <Box sx={{ p: 3, backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Typography variant="h4" component="h1" sx={{ fontWeight: "bold" }}>
          User Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsCreateModalOpen(true)}
          sx={{
            backgroundColor: "#673ab7",
            "&:hover": {
              backgroundColor: "#5e35b1",
            },
            borderRadius: "8px",
            padding: "10px 20px",
            textTransform: "none",
            fontWeight: "bold",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
        >
          New User
        </Button>
      </Box>

      <Paper
        sx={{
          width: "100%",
          overflow: "hidden",
          borderRadius: "12px",
          boxShadow: 3,
        }}
      >
        <TableContainer sx={{ maxHeight: "calc(100vh - 250px)" }}>
          <Table stickyHeader aria-label="user management table">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={
                      selected.length > 0 && selected.length < users.length
                    }
                    checked={
                      users.length > 0 && selected.length === users.length
                    }
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>User</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Username Tag</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Role</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Teams</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: "bold", textAlign: "right" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => {
                const isItemSelected = isSelected(user.id);
                const userAssociatedTeams = (user.teams ||
                  []) as UserAssociatedTeamInfo[];

                return (
                  <TableRow
                    hover
                    onClick={(event) => handleClick(event, user.id)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={user.id}
                    selected={isItemSelected}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox color="primary" checked={isItemSelected} />
                    </TableCell>
                    <TableCell component="th" scope="row">
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar
                          src={user.avatarUrl}
                          alt={user.username}
                          sx={{
                            width: 36,
                            height: 36,
                            mr: 1.5,
                            fontSize: "0.9rem",
                          }}
                        >
                          {getInitials(user.username)}
                        </Avatar>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 500 }}
                          >
                            {user.username}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        @{user.username}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        size="small"
                        color={
                          user.role === UserRole.MANAGER
                            ? "primary"
                            : user.role === UserRole.ROOT
                            ? "warning"
                            : "default"
                        }
                        sx={{ textTransform: "capitalize", fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {userAssociatedTeams.length === 0 ? (
                          <Typography variant="caption" color="text.secondary">
                            No teams assigned
                          </Typography>
                        ) : (
                          <>
                            {userAssociatedTeams.slice(0, 3).map((teamInfo) => {
                              const chipStyle = getTeamChipStyle(teamInfo.id);
                              return (
                                <Chip
                                  key={teamInfo.id}
                                  label={teamInfo.name}
                                  size="small"
                                  sx={{
                                    backgroundColor: chipStyle.backgroundColor,
                                    color: chipStyle.color,
                                    fontWeight: 500,
                                    borderRadius: "6px",
                                  }}
                                />
                              );
                            })}
                            {userAssociatedTeams.length > 3 && (
                              <Tooltip
                                title={userAssociatedTeams
                                  .slice(3)
                                  .map((ti) => ti.name)
                                  .join(", ")}
                              >
                                <Chip
                                  label={`+${userAssociatedTeams.length - 3}`}
                                  size="small"
                                  sx={{
                                    backgroundColor: "action.hover",
                                    color: "text.secondary",
                                    fontWeight: 500,
                                    borderRadius: "6px",
                                  }}
                                />
                              </Tooltip>
                            )}
                          </>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        Active
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        aria-label="more actions"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleMenuOpen(event, user);
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <Menu
          id="actions-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleViewProfile}>
            <ListItemIcon>
              <VisibilityIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>View profile</ListItemText>
          </MenuItem>
          <MenuItem onClick={handlePermissions}>
            <ListItemIcon>
              <VpnKeyIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Permission</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteUser(currentUserActions?.id);
            }}
            sx={{ color: "error.main" }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" sx={{ color: "error.main" }} />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={pagination?.totalRecords}
          rowsPerPage={rowsPerPage}
          page={currentPage - 1}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ borderTop: "1px solid #eee" }}
        />
      </Paper>
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          dispatch(fetchUsers(1, rowsPerPage));
        }}
      />
    </Box>
  );
};

export default UserManagementTable;
