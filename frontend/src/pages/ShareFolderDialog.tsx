import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchFolderPermissions,
  shareFolder,
  revokeShare,
  setDialogFolderContext,
  clearShareError,
  clearRevokeErrorForUser,
} from "../store/actions/folderShareActions";
import { AccessLevel } from "../store/reducers/folderShareReducer";
import type { RootState } from "../store/index.ts";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  MenuItem,
  Select,
  IconButton,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Autocomplete from "@mui/material/Autocomplete";
import { fetchUsers } from "../store/actions/userListActions.ts";

interface ShareFolderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  folderId: string;
  folderName?: string;
}

const ShareFolderDialog: React.FC<ShareFolderDialogProps> = ({
  isOpen,
  onClose,
  folderId,
  folderName,
}) => {
  const dispatch = useDispatch();
  const {
    sharedWith,
    isLoadingSharedWith,
    loadSharedWithError,
    isSharing,
    shareError,
    revokingStatus,
    folderIdForDialog,
  } = useSelector((state: RootState) => state.folderShares);

  const users = useSelector((state: RootState) => state.userList.users || []);
  const userSearchLoading = useSelector(
    (state: RootState) => state.userList.isLoading
  );

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedAccessLevel, setSelectedAccessLevel] = useState<AccessLevel>(
    AccessLevel.READ
  );

  const [optimisticSharedWith, setOptimisticSharedWith] = useState<string[]>(
    []
  );

  useEffect(() => {
    if (isOpen && folderId) {
      if (folderIdForDialog !== folderId) {
        dispatch(setDialogFolderContext(folderId));
      }
      dispatch(fetchFolderPermissions(folderId));
    }
  }, [isOpen, folderId, dispatch, folderIdForDialog]);

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchUsers(1, 999));
    }
  }, [isOpen, dispatch]);

  const handleClose = useCallback(() => {
    dispatch(setDialogFolderContext(null));
    setSelectedUser(null);
    setSelectedAccessLevel(AccessLevel.READ);
    dispatch(clearShareError());
    onClose();
  }, [dispatch, onClose]);

  useEffect(() => {
    if (!isOpen && folderIdForDialog) {
      handleClose();
    }
  }, [isOpen, folderIdForDialog, handleClose]);

  const handleShareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !folderId) {
      dispatch(clearShareError());
      return;
    }
    dispatch(clearShareError());
    setOptimisticSharedWith((prev) =>
      prev.includes(selectedUser.id) ? prev : [...prev, selectedUser.id]
    );
    dispatch(shareFolder(folderId, selectedUser.id, selectedAccessLevel));
    setSelectedUser(null);
    setSelectedAccessLevel(AccessLevel.READ);
  };

  const handleRevokeAccess = async (userIdToRevoke: string) => {
    if (!folderId) return;
    dispatch(clearRevokeErrorForUser(userIdToRevoke));
    setOptimisticSharedWith((prev) =>
      prev.filter((id) => id !== userIdToRevoke)
    );
    dispatch(revokeShare(folderId, userIdToRevoke));
  };

  useEffect(() => {
    if (sharedWith) {
      setOptimisticSharedWith(sharedWith.map((u) => u.userId));
    }
  }, [sharedWith]);

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Share "{folderName || `Folder`}"
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
          aria-label="Close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleShareSubmit} sx={{ mb: 3 }}>
          <Autocomplete
            options={users}
            getOptionLabel={(option) => `${option.username} (${option.email})`}
            filterOptions={(options, { inputValue }) =>
              options.filter(
                (u) =>
                  u.username.toLowerCase().includes(inputValue.toLowerCase()) ||
                  u.email.toLowerCase().includes(inputValue.toLowerCase())
              )
            }
            loading={userSearchLoading}
            value={selectedUser}
            onChange={(_, value) => setSelectedUser(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="User to Share With"
                placeholder="Type username or email"
                margin="normal"
                required
              />
            )}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            sx={{ mb: 2 }}
          />
          <Select
            id="accessLevel"
            value={selectedAccessLevel}
            onChange={(e) =>
              setSelectedAccessLevel(e.target.value as AccessLevel)
            }
            fullWidth
            sx={{ mt: 2 }}
          >
            <MenuItem value={AccessLevel.READ}>Can Read</MenuItem>
            <MenuItem value={AccessLevel.WRITE}>Can Write</MenuItem>
          </Select>
          {shareError && (
            <Typography color="error" sx={{ mt: 2 }}>
              Error: {shareError}
            </Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3 }}
            disabled={isSharing || !selectedUser}
            startIcon={
              isSharing ? (
                <CircularProgress size={18} color="inherit" />
              ) : undefined
            }
          >
            {isSharing ? "Sharing..." : "Add Permission"}
          </Button>
        </Box>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Currently Shared With:
        </Typography>
        {isLoadingSharedWith && (
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            <Typography variant="body2">Loading permissions...</Typography>
          </Box>
        )}
        {loadSharedWithError && (
          <Typography color="error" sx={{ mb: 2 }}>
            Error loading permissions: {loadSharedWithError}
          </Typography>
        )}
        {!isLoadingSharedWith &&
          !loadSharedWithError &&
          optimisticSharedWith.length === 0 && (
            <Typography variant="body2" sx={{ mb: 2, fontStyle: "italic" }}>
              Not shared with anyone yet.
            </Typography>
          )}
        {optimisticSharedWith.length > 0 && (
          <List>
            {sharedWith
              .filter((share) => optimisticSharedWith.includes(share.userId))
              .map((share) => {
                const userRevokeInfo = revokingStatus[share.userId];
                const isRevokingThisUser = userRevokeInfo?.inProgress;
                const revokeErrorForThisUser = userRevokeInfo?.error;
                const userObj = users.find((u) => u.id === share.userId);
                const username = userObj ? userObj.username : share.userId;
                return (
                  <ListItem
                    key={share.userId}
                    secondaryAction={
                      <Button
                        onClick={() => handleRevokeAccess(share.userId)}
                        color="error"
                        size="small"
                        disabled={isRevokingThisUser}
                        sx={{ minWidth: 80 }}
                      >
                        {isRevokingThisUser ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : (
                          "Revoke"
                        )}
                      </Button>
                    }
                  >
                    <ListItemText
                      primary={username}
                      secondary={share.accessLevel}
                    />
                    {revokeErrorForThisUser && (
                      <Typography
                        color="error"
                        variant="caption"
                        sx={{ ml: 2 }}
                      >
                        Error: {revokeErrorForThisUser}
                      </Typography>
                    )}
                  </ListItem>
                );
              })}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="contained">
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShareFolderDialog;
