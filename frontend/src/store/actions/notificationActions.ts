// src/store/actions/notificationActions.ts
import type { SnackbarSeverity } from '../../types/notifications.types.ts';
import { SHOW_SNACKBAR, HIDE_SNACKBAR } from './actionTypes';

export interface ShowSnackbarAction {
  type: typeof SHOW_SNACKBAR;
  payload: {
    message: string;
    severity: SnackbarSeverity;
    autoHideDuration?: number | null;
  };
}

export interface HideSnackbarAction {
  type: typeof HIDE_SNACKBAR;
}

export type NotificationActionTypes = ShowSnackbarAction | HideSnackbarAction;

export const showSnackbar = (
  message: string,
  severity: SnackbarSeverity = "info",
  autoHideDuration: number | null = 6000 // Default 6 seconds
): ShowSnackbarAction => ({
  type: SHOW_SNACKBAR,
  payload: { message, severity, autoHideDuration },
});

export const hideSnackbar = (): HideSnackbarAction => ({
  type: HIDE_SNACKBAR,
});
