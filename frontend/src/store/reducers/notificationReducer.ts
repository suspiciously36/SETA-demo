import type { NotificationState } from '../../types/notifications.types.ts';
import { HIDE_SNACKBAR, SHOW_SNACKBAR } from '../actions/actionTypes.ts';
import type { NotificationActionTypes } from '../actions/notificationActions.ts';

const initialState: NotificationState = {
  open: false,
  message: '',
  severity: 'info', 
  autoHideDuration: 6000,
};

const notificationReducer = (
  state: NotificationState = initialState,
  action: NotificationActionTypes
): NotificationState => {
  switch (action.type) {
    case SHOW_SNACKBAR:
      return {
        ...state,
        open: true,
        message: action.payload.message,
        severity: action.payload.severity,
        autoHideDuration: action.payload.autoHideDuration !== undefined 
                          ? action.payload.autoHideDuration 
                          : initialState.autoHideDuration,
      };
    case HIDE_SNACKBAR:
      return {
        ...state,
        open: false,
      };
    default:
      return state;
  }
};

export default notificationReducer;
