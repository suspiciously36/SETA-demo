import React, { useEffect, useState } from "react";
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
  TablePagination,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CreateUserModal from "./CreateUserModal";

import { showSnackbar } from "../../store/actions/notificationActions";
import { getInitials } from "../../utils/helpers/getInitials.ts";
import { useNavigate } from "react-router-dom";

const getTeamChipStyle = (teamNameOrId: string) => {
  let hash = 0;
  for (let i = 0; i < teamNameOrId.length; i++) {
    hash = teamNameOrId.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360;

  const backgroundColor = `hsl(${hue}, 100%, 90%)`;
  const color = `hsl(${hue}, 100%, 30%)`;

  return { backgroundColor, color };
};

const UserManagementTable: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const { users, loading, error, pagination } = useSelector(
    (state: RootState) => state.userList
  );
  const loggedInUser = useSelector((state: RootState) => state.auth.user);

  const canDeleteUsers = loggedInUser?.role === UserRole.ROOT;

  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [selected, setSelected] = useState<readonly string[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [currentUserActions, setCurrentUserActions] =
    useState<DetailedUser | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const canManageUsers =
    loggedInUser?.role === UserRole.ROOT ||
    loggedInUser?.role === UserRole.MANAGER;

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
    if (event.target.checked && users) {
      const newSelecteds = users.map((n) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (_event: React.MouseEvent<unknown>, id: string) => {
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
    if (!canManageUsers) return;
    setAnchorEl(event.currentTarget);
    setCurrentUserActions(user);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentUserActions(null);
  };
  const handleViewAssets = () => {
    const isManagerOfThisUser =
      loggedInUser?.role === UserRole.MANAGER &&
      currentUserActions?.teams?.some(
        (team) =>
          team.id ===
          users.find((u) => u.id === loggedInUser?.id)?.teams?.[0]?.id
      );

    if (!isManagerOfThisUser || !currentUserActions?.id) {
      dispatch(
        showSnackbar(
          "You do not have permission to view this user's assets.",
          "error"
        )
      );
      return;
    }

    navigate(`/users/${currentUserActions.id}/assets`);
    handleMenuClose();
  };

  const handlePermissions = () => {
    if (currentUserActions) console.log("Permissions:", currentUserActions.id);
    handleMenuClose();
  };

  const handleDeleteUserConfirmed = async () => {
    if (currentUserActions && currentUserActions.id && canManageUsers) {
      const userIdToDelete = currentUserActions.id;
      const usernameToDelete = currentUserActions.username;
      if (
        window.confirm(
          `Are you sure you want to delete user "${usernameToDelete}"? This action cannot be undone.`
        )
      ) {
        try {
          await dispatch(deleteUser(userIdToDelete, currentPage, rowsPerPage));
          dispatch(
            showSnackbar(
              `User "${usernameToDelete}" deleted successfully.`,
              "success"
            )
          );
          if (
            users.length === 1 &&
            currentPage > 1 &&
            pagination &&
            pagination.totalRecords > 0
          ) {
            const newTotalPages = Math.ceil(
              (pagination.totalRecords - 1) / rowsPerPage
            );
            if (currentPage > newTotalPages && newTotalPages > 0) {
              setCurrentPage(newTotalPages);
            }
          } else if (pagination && pagination.totalRecords - 1 === 0) {
            setCurrentPage(1);
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

  if (loading && (!users || users.length === 0))
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="300px"
      >
        {" "}
        <CircularProgress />{" "}
        <Typography sx={{ ml: 2 }}>Loading users...</Typography>{" "}
      </Box>
    );

  if (error && (!users || users.length === 0))
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {" "}
        Error fetching users: {error}{" "}
      </Alert>
    );

  return (
    <Box sx={{ minHeight: "100vh" }}>
      {" "}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography
          variant="h4"
          component="h2"
          sx={{ fontWeight: "400", color: "#666" }}
        >
          User Management
        </Typography>
        {canManageUsers && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsCreateUserModalOpen(true)}
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
            NEW USER
          </Button>
        )}
      </Box>
      <Paper
        sx={{
          width: "100%",
          overflow: "hidden",
          borderRadius: "12px",
          boxShadow: "0px 4px 20px rgba(0,0,0,0.05)",
        }}
      >
        <TableContainer sx={{ maxHeight: "calc(100vh - 220px)" }}>
          <Table stickyHeader aria-label="user management table">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={
                      users &&
                      selected.length > 0 &&
                      selected.length < users.length
                    }
                    checked={
                      users &&
                      users.length > 0 &&
                      selected.length === users.length
                    }
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "text.secondary" }}>
                  User
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "text.secondary" }}>
                  Username Tag
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "text.secondary" }}>
                  Role
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "text.secondary" }}>
                  Teams
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "text.secondary" }}>
                  Status
                </TableCell>
                {canManageUsers && (
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      textAlign: "right",
                      color: "text.secondary",
                    }}
                  >
                    {" "}
                    Actions{" "}
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && users && users.length > 0 && (
                <TableRow>
                  {" "}
                  <TableCell
                    colSpan={canManageUsers ? 7 : 6}
                    align="center"
                    sx={{ p: 0, position: "relative", border: 0 }}
                  >
                    {" "}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "rgba(255,255,255,0.5)",
                      }}
                    >
                      {" "}
                      <CircularProgress size={30} />{" "}
                    </Box>{" "}
                  </TableCell>{" "}
                </TableRow>
              )}
              {!loading && users && users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={canManageUsers ? 7 : 6} align="center">
                    <Typography sx={{ p: 3, color: "text.secondary" }}>
                      No users to display.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {users &&
                users.map((user) => {
                  const isItemSelected = isSelected(user.id);
                  const userAssociatedTeams = (user.teams ||
                    []) as UserAssociatedTeamInfo[];

                  return (
                    <TableRow
                      hover
                      onClick={(event: React.MouseEvent<unknown>) =>
                        handleClick(event, user.id)
                      }
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={user.id}
                      selected={isItemSelected}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell padding="checkbox">
                        {" "}
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                        />{" "}
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
                            {" "}
                            {getInitials(user.username)}{" "}
                          </Avatar>
                          <Box>
                            {" "}
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 500 }}
                            >
                              {" "}
                              {user.username}{" "}
                            </Typography>{" "}
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {" "}
                              {user.email}{" "}
                            </Typography>{" "}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {" "}
                        <Typography variant="body2" color="text.secondary">
                          {" "}
                          @{user.username
                            .replace(/\s+/g, "_")
                            .toLowerCase()}{" "}
                        </Typography>{" "}
                      </TableCell>
                      <TableCell>
                        {" "}
                        <Chip
                          label={
                            user.role.charAt(0).toUpperCase() +
                            user.role.slice(1)
                          }
                          size="small"
                          color={
                            user.role === UserRole.MANAGER
                              ? "primary"
                              : user.role === UserRole.ROOT
                              ? "error"
                              : "default"
                          }
                          sx={{
                            textTransform: "capitalize",
                            fontWeight: 500,
                            borderRadius: "6px",
                          }}
                        />{" "}
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                        >
                          {userAssociatedTeams.length === 0 ? (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {" "}
                              No teams assigned{" "}
                            </Typography>
                          ) : (
                            <>
                              {userAssociatedTeams
                                .slice(0, 3)
                                .map((teamInfo) => {
                                  const chipStyle = getTeamChipStyle(
                                    teamInfo.name
                                  );
                                  return (
                                    <Chip
                                      key={teamInfo.id}
                                      label={teamInfo.name}
                                      size="small"
                                      sx={{
                                        backgroundColor:
                                          chipStyle.backgroundColor,
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
                                  {" "}
                                  <Chip
                                    label={`+${userAssociatedTeams.length - 3}`}
                                    size="small"
                                    sx={{
                                      backgroundColor: "action.hover",
                                      color: "text.secondary",
                                      fontWeight: 500,
                                      borderRadius: "6px",
                                    }}
                                  />{" "}
                                </Tooltip>
                              )}
                            </>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {" "}
                        <Chip
                          label="Active"
                          size="small"
                          sx={{
                            bgcolor: "success.light",
                            color: "success",
                            fontWeight: 500,
                            borderRadius: "6px",
                          }}
                        />{" "}
                      </TableCell>
                      {canManageUsers && (
                        <TableCell align="right">
                          {" "}
                          <IconButton
                            aria-label="more actions"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleMenuOpen(event, user);
                            }}
                          >
                            {" "}
                            <MoreVertIcon />{" "}
                          </IconButton>{" "}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={pagination?.totalRecords || 0}
          rowsPerPage={rowsPerPage}
          page={currentPage - 1}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ borderTop: "1px solid #e0e0e0" }}
        />
        {canManageUsers && (
          <Menu
            id="actions-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleViewAssets}>
              <ListItemIcon>
                <VisibilityIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>View assets</ListItemText>
            </MenuItem>
            <MenuItem onClick={handlePermissions} disabled={true}>
              <ListItemIcon>
                <VpnKeyIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Permission</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={handleDeleteUserConfirmed}
              disabled={!canDeleteUsers}
              sx={{ color: "error.main" }}
            >
              <ListItemIcon>
                <DeleteIcon fontSize="small" sx={{ color: "error.main" }} />
              </ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>
          </Menu>
        )}
      </Paper>
      <CreateUserModal
        isOpen={isCreateUserModalOpen}
        onClose={() => setIsCreateUserModalOpen(false)}
        onSubmit={() => {
          setCurrentPage(1);
          dispatch(fetchUsers(1, rowsPerPage));
        }}
      />
    </Box>
  );
};

export default UserManagementTable;
