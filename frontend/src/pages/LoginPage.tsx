// src/pages/LoginPage.tsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Link as RouterLink } from "react-router-dom";
import { loginUser } from "../store/actions/authActions"; // Adjust path
import { RootState, AppDispatch } from "../store"; // Adjust path

import loginBackgroundImage from "../assets/images/login-background.jpg"; // Adjust path if necessary

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import "../styles/LoginPage.css";

const LOGO_BOX_HEIGHT = 65;
const LOGO_BOX_WIDTH = 175;
const LOGO_BORDER_RADIUS = "32px";
const MAIN_CARD_BORDER_RADIUS = "32px";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const dispatch: AppDispatch = useDispatch();
  const {
    isAuthenticated,
    loading,
    error: authError,
  } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (authError) {
      setLocalError(authError);
    }
  }, [authError]);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);
    try {
      await dispatch(loginUser({ email, password }));
    } catch (error) {
      console.error("Login submission error caught in component:", error);
    }
  };

  if (isAuthenticated) {
    // Your code redirects to "/", App.tsx handles /users then
    return <Navigate to="/" replace />;
  }

  return (
    <Box
      className="login-page-container" // Added class for potential global page styling
      sx={{
        minHeight: "100vh",
        width: "100vw",
        position: "relative",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        overflow: "hidden",
      }}
    >
      {/* Two-column background layer (remains full screen) */}
      <Box
        className="login-page-bg" // Added class
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          zIndex: 0,
        }}
      >
        {/* Left Gradient Column */}
        <Box
          sx={{
            width: { xs: "0%", sm: "30%", md: "40%" },
            height: "100%",
            background:
              "linear-gradient(180deg, #fff 0%,rgb(166, 197, 240) 100%)", // Your gradient
            display: { xs: "none", sm: "block" },
          }}
        />
        {/* Right Image Column */}
        <Box
          sx={{
            width: { xs: "100%", sm: "70%", md: "60%" },
            height: "100%",
            backgroundImage: `url(${loginBackgroundImage})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "center left",
            zIndex: 1,
          }}
        />
      </Box>

      {/* Login Form Card (Upper Layer) */}
      <Paper
        className="login-form-card-paper" // Added class
        elevation={16}
        sx={{
          boxShadow: "6px 8px rgba(0,0,0,0.1)",
          p: { xs: 3, sm: 4, md: 5 }, // Keep padding for inner content
          zIndex: 1,
          backgroundColor: "#fff",
          borderRadius: MAIN_CARD_BORDER_RADIUS, // Your borderRadius
          width: {
            xs: "90%",
            sm: "calc(80% - 5vw)",
            md: "calc(70% - 5vw)",
            lg: "calc(60% - 5vw)",
          },
          maxWidth: "650px", // Your maxWidth
          marginLeft: { xs: "5%", sm: "10vw" },
          marginRight: { xs: "5%", sm: "auto" },
          marginTop: { xs: "10vh", sm: "5vh" },
          marginBottom: { xs: "10vh", sm: "5vh" },
          minHeight: "90vh", // Your minHeight
          height: "auto",
          maxHeight: "90vh", // Your maxHeight
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
          overflow: "visible", // Important for overlapping logo
        }}
      >
        <Box
          className="login-form-card-tag"
          sx={{
            position: "absolute",
            top: `40px`, // Your positioning
            left: `750px`, // Your positioning
            width: `300px`,
            height: `75px`,
            backgroundColor: "rgba(48, 112, 196, 0.95)", // Your logo bg color
            color: "#fff",
            display: "flex",
            alignItems: "left",
            justifyContent: "left",
            flexFlow: "column",
            borderRadius: "12px", // Your logo border radius
            boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
            zIndex: 2, // Ensure logo is above the paper's pseudo-elements if any
          }}
        >
          <Typography
            sx={{
              paddingLeft: "16px",
              paddingTop: "12px",
            }}
          >
            Task review Team
          </Typography>
          <Typography
            sx={{
              paddingLeft: "16px",
            }}
          >
            3:00PM - 3:30PM
          </Typography>
        </Box>
        <Box
          className="login-form-card-tag-bottom"
          sx={{
            position: "absolute",
            top: `75px`, // Your positioning
            left: `790px`, // Your positioning
            width: `300px`,
            height: `75px`,
            backgroundColor: "rgba(48, 112, 196, 0.7)", // Your logo bg color
            color: "#fff",
            display: "flex",
            alignItems: "left",
            justifyContent: "left",
            flexFlow: "column",
            borderRadius: "12px", // Your logo border radius
            boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
            zIndex: 1, // Ensure logo is above the paper's pseudo-elements if any
          }}
        >
          <Typography
            sx={{
              paddingLeft: "16px",
              paddingTop: "12px",
            }}
          >
            Task review Team
          </Typography>
          <Typography
            sx={{
              paddingLeft: "16px",
              paddingTop: "6px",
            }}
          >
            3:30PM - 4:00PM
          </Typography>
        </Box>
        <Box
          className="login-form-card-blur-bottom"
          sx={{
            position: "absolute",
            top: `575px`, // Your positioning
            left: `800px`, // Your positioning
            width: `450px`,
            height: `150px`,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "left",
            flexFlow: "column",
            backgroundColor: "rgba(255, 255, 255, 0.3)", // Semi-transparent background is crucial
            backdropFilter: "blur(10px) saturate(180%)", // Apply blur and a bit of saturation
            WebkitBackdropFilter: "blur(10px) saturate(180%)", // For Safari support
            border: "1px solid rgba(209, 213, 219, 0.3)", // Optional subtle border
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)", // Optional subtle shadow
            borderRadius: "12px",
            zIndex: 2, // Ensure it's above the main background image but below the login form card if it overlaps
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 500,
              textAlign: "right",
              letterSpacing: "1.5px",
              mb: 1,
            }}
          >
            Mon &nbsp;&nbsp; Tue &nbsp;&nbsp; Wed &nbsp;&nbsp; Thu &nbsp;&nbsp;
            Fri &nbsp;&nbsp; Sat &nbsp;&nbsp; Sun
          </Typography>
          <Typography
            variant="h6"
            sx={{ fontWeight: 500, textAlign: "right", letterSpacing: "2px" }}
          >
            12 &nbsp;&nbsp; 13 &nbsp;&nbsp; 14 &nbsp;&nbsp; 15 &nbsp;&nbsp; 16
            &nbsp;&nbsp; 17 &nbsp;&nbsp; 18
          </Typography>
          {/* ... more calendar content ... */}
        </Box>
        <Box
          className="login-form-card-tag-white"
          sx={{
            position: "absolute",
            top: `650px`, // Your positioning
            left: `750px`, // Your positioning
            width: `350px`,
            height: `150px`,
            backgroundColor: "#fff", // Your logo bg color
            color: "#fff",
            display: "flex",
            alignItems: "left",
            justifyContent: "left",
            flexFlow: "column",
            borderRadius: "12px", // Your logo border radius
            boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
            zIndex: 2, // Ensure logo is above the paper's pseudo-elements if any
          }}
        >
          <Typography
            sx={{
              fontSize: "1.2rem",
              color: "rgba(48, 112, 196, 1)",
              paddingLeft: "16px",
              paddingTop: "12px",
            }}
          >
            Daily Meeting
          </Typography>
          <Typography
            sx={{
              color: "rgba(48, 112, 196, 1)",
              paddingLeft: "16px",
            }}
          >
            9:30AM - 10:00AM
          </Typography>
        </Box>
        {/* LOGO Box - Positioned to overlap top-left */}
        <Box
          className="logo-box-wrapper" // Added class
          sx={{
            position: "absolute",
            top: `-${LOGO_BOX_HEIGHT / 3}px`, // Your positioning
            left: `-${LOGO_BOX_WIDTH / 9}px`, // Your positioning
            width: `${LOGO_BOX_WIDTH}px`,
            height: `${LOGO_BOX_HEIGHT}px`,
            backgroundColor: "rgba(35, 99, 182, 0.8)", // Your logo bg color
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: LOGO_BORDER_RADIUS, // Your logo border radius
            boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
            zIndex: 2, // Ensure logo is above the paper's pseudo-elements if any
          }}
        >
          <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
            LOGO
          </Typography>
        </Box>

        {/* Inner content of the Paper */}
        <Container
          maxWidth="xs"
          // The paddingTop here needs to be enough to clear the overlapping LOGO
          sx={{ mt: `${LOGO_BOX_HEIGHT * 0.8}px`, width: "100%" }}
        >
          <Box
            className="login-form-inner-content" // Added class
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center", // Center form items if desired, or flex-start
              width: "100%",
              paddingTop: "100px", // Your original padding, adjust based on LOGO
            }}
          >
            <Typography
              component="h1"
              variant="h3" // Your variant
              sx={{
                fontWeight: "bold",
                mb: 9, // Your margin
                color: "#666", // Your color
                width: "100%",
                textAlign: "left", // Your alignment
              }}
            >
              Welcome!
            </Typography>
            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{ mt: 1, width: "100%" }}
            >
              {/* Email Field */}
              <Typography
                variant="caption"
                display="block"
                gutterBottom
                sx={{
                  fontWeight: 500,
                  color: "text.secondary",
                  mb: 0.5,
                  fontSize: "1rem",
                }}
              >
                Email
              </Typography>
              <TextField
                margin="none"
                required
                fullWidth
                id="email"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="root@email.com"
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "32px",
                    backgroundColor: "#f3f4f6",
                    "& fieldset": { borderColor: "transparent" },
                    "&:hover fieldset": {
                      borderColor: "rgba(103, 58, 183, 0.5)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#673ab7",
                      borderWidth: "1px",
                    },
                  },
                }}
              />
              {/* Password Field */}
              <Typography
                variant="caption"
                display="block"
                gutterBottom
                sx={{
                  fontWeight: 500,
                  color: "text.secondary",
                  mb: 0.5,
                  fontSize: "1rem",
                }}
              >
                Password
              </Typography>
              <TextField
                margin="none"
                required
                fullWidth
                name="password"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
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
                  mb: 1,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "32px",
                    backgroundColor: "#f3f4f6",
                    "& fieldset": { borderColor: "transparent" },
                    "&:hover fieldset": {
                      borderColor: "rgba(103, 58, 183, 0.5)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#673ab7",
                      borderWidth: "1px",
                    },
                  },
                }}
              />
              {/* Forgot Password Link */}
              <Box
                sx={{
                  textAlign: "right",
                  width: "100%",
                  mb: 3,
                  fontSize: "1rem",
                }}
              >
                <Link
                  href="#"
                  variant="body2"
                  sx={{
                    color: "rgba(35, 99, 182, 0.8)",
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  Forgot password?
                </Link>
              </Box>
              {/* Error Alert */}
              {localError && (
                <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
                  {" "}
                  {localError}{" "}
                </Alert>
              )}
              {/* Login Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 0,
                  mb: 2,
                  py: 1.5,
                  borderRadius: "32px",
                  backgroundColor: "rgba(35, 99, 182, 0.8)",
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  boxShadow: "0 4px 12px rgba(103, 58, 183, 0.3)",
                  "&:hover": { backgroundColor: "rgba(35, 99, 182, 0.9)" },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Login"
                )}
              </Button>
              {/* Create Account Link */}
              <Typography
                variant="body2"
                align="center"
                sx={{ color: "text.secondary", fontSize: "1rem" }}
              >
                New member?{" "}
                <Link
                  component={RouterLink}
                  to="/signup"
                  variant="body2"
                  sx={{
                    fontWeight: "bold",
                    fontSize: "1rem",
                    color: "rgba(35, 99, 182, 0.8)",
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  Create account
                </Link>
              </Typography>
            </Box>
          </Box>
        </Container>
      </Paper>
    </Box>
  );
};

export default LoginPage;
