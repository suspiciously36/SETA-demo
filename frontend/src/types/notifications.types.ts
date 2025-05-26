export type SnackbarSeverity = "success" | "error" | "warning" | "info";

export interface NotificationState {
  open: boolean;
  message: string;
  severity: SnackbarSeverity;
  autoHideDuration: number | null; 
}
