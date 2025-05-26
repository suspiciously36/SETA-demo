import React, { useState, FormEvent, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CreateUserReqDto, UserRole } from "../../types/user.types";
import { submitNewUser } from "../../store/actions/userListActions";
import { RootState, AppDispatch } from "../../store";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  SelectChangeEvent,
  InputAdornment,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import { showSnackbar } from "../../store/actions/notificationActions.ts";

import appLogo from "../../assets/images/seta-removebg-preview.png";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const { creatingUserLoading, creatingUserError } = useSelector(
    (state: RootState) => state.userList
  );
  const loggedInUser = useSelector((state: RootState) => state.auth.user);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.MEMBER);
  const [showPassword, setShowPassword] = useState(false);

  const [localFormError, setLocalFormError] = useState<string | null>(null);

  const isAuthorizedToCreate =
    loggedInUser?.role === UserRole.ROOT ||
    loggedInUser?.role === UserRole.MANAGER;

  const resetForm = useCallback(() => {
    setUsername("");
    setEmail("");
    setPassword("");
    setRole(UserRole.MEMBER);
    setShowPassword(false);
    setLocalFormError(null);
  }, []);

  const handleActualClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen, creatingUserError, dispatch, resetForm]);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const handleRoleChange = (event: SelectChangeEvent<UserRole>) => {
    setRole(event.target.value as UserRole);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalFormError(null);

    if (!isAuthorizedToCreate) {
      dispatch(
        showSnackbar("You are not authorized to create users.", "error")
      );
      return;
    }

    if (!username.trim() || !email.trim() || !password.trim()) {
      setLocalFormError(
        "All fields (Username, Email, Password, Role) are required."
      );
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setLocalFormError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setLocalFormError("Password must be at least 6 characters long.");
      return;
    }

    const userData: CreateUserReqDto = { username, email, password, role };

    dispatch(submitNewUser(userData));
  };

  const prevCreatingUserLoading = React.useRef(creatingUserLoading);
  useEffect(() => {
    if (prevCreatingUserLoading.current && !creatingUserLoading) {
      if (!creatingUserError) {
        dispatch(
          showSnackbar(`Create new user: ${username} successfully! `, "success")
        );
        onSubmit();
        handleActualClose();
      } else {
        dispatch(
          showSnackbar(`Error creating user: ${creatingUserError}`, "error")
        );
      }
    }
    prevCreatingUserLoading.current = creatingUserLoading;
  }, [
    dispatch,
    creatingUserLoading,
    creatingUserError,
    username,
    handleActualClose,
  ]);

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={handleActualClose}
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: "24px",
            p: { xs: 2, sm: 3, md: 4 },
            m: 2,
            width: "100%",
          },
        }}
      >
        <DialogTitle sx={{ p: 0, mb: 3, textAlign: "left" }}>
          {" "}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <img
              src={appLogo}
              alt="App Logo"
              style={{
                height: "50%",
                maxWidth: "50%",
                objectFit: "contain",
              }}
            />
            <IconButton
              aria-label="close"
              onClick={handleActualClose}
              sx={{ color: (theme) => theme.palette.grey[500] }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {" "}
          <Typography
            component="h1"
            variant="h4"
            sx={{ fontWeight: "bold", mb: 3, color: "#333", textAlign: "left" }}
          >
            Create user
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ width: "100%" }}
          >
            <Typography
              variant="caption"
              display="block"
              gutterBottom
              sx={{ fontWeight: 500, color: "text.secondary", mb: 0.5 }}
            >
              Username
            </Typography>
            <TextField
              autoFocus
              required
              fullWidth
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., Chloe_Dev"
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  backgroundColor: "#f3f4f6",
                  "& fieldset": { borderColor: "transparent" },
                  "&:hover fieldset": {
                    borderColor: "rgba(48, 112, 196, 0.95)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "rgba(48, 112, 196, 0.95)",
                    borderWidth: "1px",
                  },
                },
              }}
            />

            <Typography
              variant="caption"
              display="block"
              gutterBottom
              sx={{ fontWeight: 500, color: "text.secondary", mb: 0.5 }}
            >
              Email
            </Typography>
            <TextField
              required
              fullWidth
              id="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  backgroundColor: "#f3f4f6",
                  "& fieldset": { borderColor: "transparent" },
                  "&:hover fieldset": {
                    borderColor: "rgba(48, 112, 196, 0.95)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "rgba(48, 112, 196, 0.95)",
                    borderWidth: "1px",
                  },
                },
              }}
            />

            <Typography
              variant="caption"
              display="block"
              gutterBottom
              sx={{ fontWeight: 500, color: "text.secondary", mb: 0.5 }}
            >
              Password
            </Typography>
            <TextField
              required
              fullWidth
              name="password"
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {" "}
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {" "}
                      {showPassword ? <VisibilityOff /> : <Visibility />}{" "}
                    </IconButton>{" "}
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  backgroundColor: "#f3f4f6",
                  "& fieldset": { borderColor: "transparent" },
                  "&:hover fieldset": {
                    borderColor: "rgba(48, 112, 196, 0.95)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "rgba(48, 112, 196, 0.95)",
                    borderWidth: "1px",
                  },
                },
              }}
            />

            <Typography
              variant="caption"
              display="block"
              gutterBottom
              sx={{ fontWeight: 500, color: "text.secondary", mb: 0.5 }}
            >
              Role
            </Typography>
            <FormControl
              fullWidth
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  backgroundColor: "#f3f4f6",
                  "& fieldset": { borderColor: "transparent" },
                  "&:hover fieldset": {
                    borderColor: "rgba(48, 112, 196, 0.95)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "rgba(48, 112, 196, 0.95)",
                    borderWidth: "1px",
                  },
                },
              }}
            >
              <Select
                labelId="role-select-label"
                id="role"
                value={role}
                onChange={handleRoleChange}
                displayEmpty
                inputProps={{ "aria-label": "Without label" }}
              >
                <MenuItem value={UserRole.MANAGER}>Manager</MenuItem>
                <MenuItem value={UserRole.MEMBER}>Member</MenuItem>
              </Select>
            </FormControl>

            {(localFormError || creatingUserError) && (
              <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
                {localFormError || creatingUserError}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={creatingUserLoading || !isAuthorizedToCreate}
              sx={{
                py: 1.5,
                borderRadius: "12px",
                backgroundColor: "rgba(48, 112, 196, 0.95)",
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: "bold",
                boxShadow: "0 4px 12px rgba(103, 58, 183, 0.3)",
                "&:hover": { backgroundColor: "rgb(43, 110, 199)" },
              }}
            >
              {creatingUserLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Create New User"
              )}{" "}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateUserModal;
