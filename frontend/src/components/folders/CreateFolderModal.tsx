import React from "react";
import type { AppDispatch, RootState } from "../../store/index.ts";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, type FormEvent } from "react";
import type { CreateFolderDto } from "../../types/folder.types.ts";
import { submitNewFolder } from "../../store/actions/folderActions.ts";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  isOpen,
  onClose,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const [folderName, setFolderName] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const { creatingLoading, creatingError } = useSelector(
    (state: RootState) => state.folders
  );

  useEffect(() => {
    if (isOpen) {
      setFolderName("");
      setLocalError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);
    if (!folderName.trim()) {
      setLocalError("Folder name cannot be empty");
      return;
    }

    const folderData: CreateFolderDto = { name: folderName };

    try {
      await dispatch(submitNewFolder(folderData));
    } catch (error) {
      console.error("Create folder submission error:", error);
    }
  };

  const prevCreatingLoading = React.useRef(creatingLoading);
  useEffect(() => {
    if (prevCreatingLoading.current && !creatingLoading) {
      if (!creatingError) {
        onClose();
      }
    }
    prevCreatingLoading.current = creatingLoading;
  }, [creatingLoading, creatingError, onClose]);

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Create New Folder</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="folderName"
            label="Folder Name"
            type="text"
            fullWidth
            variant="outlined"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            required
            error={!!localError}
            helperText={localError}
          />
          {creatingError && !creatingLoading && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {creatingError}
            </Alert>
          )}
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={creatingLoading}>
            {creatingLoading ? <CircularProgress size={24} /> : "Create Folder"}
          </Button>
        </DialogContent>
      </Box>
    </Dialog>
  );
};

export default CreateFolderModal;

