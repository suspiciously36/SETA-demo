// src/components/common/SnackbarNotifier.tsx
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Snackbar, Alert } from "@mui/material";
import type { AppDispatch, RootState } from "../store/index.ts";
import { hideSnackbar } from "../store/actions/notificationActions.ts";

const SnackbarNotifier: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { open, message, severity, autoHideDuration } = useSelector(
    (state: RootState) => state.notifications // Assuming 'notifications' is the key in rootReducer
  );

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    dispatch(hideSnackbar());
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }} // Or your preferred position
    >
      <Alert
        onClose={handleClose}
        severity={severity}
        sx={{ width: "100%" }}
        variant="filled"
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default SnackbarNotifier;
