// src/components/layout/NoteLayout.tsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Toolbar,
  Typography,
  CssBaseline,
  TextField,
  IconButton,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  Breadcrumbs,
  Link,
} from "@mui/material";
import Sidebar from "./Sidebar"; // Assuming Sidebar is in the same directory
import TopBar from "./Topbar"; // Assuming Topbar is in the same directory
import { Outlet, useLocation, useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { Note, UpdateNoteDto } from "../../types/note.types"; // Ensure correct path
import {
  submitNoteUpdate,
  fetchUserNotes,
} from "../../store/actions/noteActions"; // Ensure correct path
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import { showSnackbar } from "../../store/actions/notificationActions"; // Ensure correct path
import { Link as RouterLink } from "react-router-dom";

const NoteLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const { folderId, noteId } = useParams<{
    folderId?: string;
    noteId?: string;
  }>();

  const [activeSidebarView, setActiveSidebarView] = useState<string>("folders");

  // Selectors for notes
  const allNotes = useSelector((state: RootState) => state.notes.notes);
  const isNotesListLoading = useSelector(
    (state: RootState) => state.notes.loading
  );
  // const notesListError = useSelector((state: RootState) => state.notes.error); // For general list loading errors

  // Derive currentNote using useMemo
  const currentNote = useMemo(() => {
    if (!noteId || !allNotes || allNotes.length === 0) return null;
    // Assuming your Note type has folderId or folder_id
    return (
      allNotes.find(
        (n) =>
          n.id === noteId &&
          (n.folderId === folderId || n.folder_id === folderId)
      ) || null
    );
  }, [noteId, folderId, allNotes]);

  // Select updating status for the specific note
  // Your note reducer might store updatingLoading as a single boolean or per-note.
  // Assuming a single boolean for simplicity here. Adjust if it's per-note.
  const isUpdatingThisNote = useSelector(
    (state: RootState) => state.notes.updatingLoading
  );
  const updateErrorForThisNote = useSelector(
    (state: RootState) => state.notes.updatingError
  );

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editableTitleText, setEditableTitleText] = useState("");
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

  // Editable body state
  const [isEditingBody, setIsEditingBody] = useState(false);
  const [editableBodyText, setEditableBodyText] = useState("");

  // New states for tag editing
  const [addTagEditing, setAddTagEditing] = useState(false);
  const [addTagValue, setAddTagValue] = useState("");

  // Effect to fetch notes if not already loaded, though Sidebar might do this.
  // This is a fallback or explicit load trigger for the layout.
  useEffect(() => {
    if (!allNotes || allNotes.length === 0) {
      dispatch(fetchUserNotes());
    }
  }, [dispatch, allNotes]);

  useEffect(() => {
    if (folderId && noteId) {
      setActiveSidebarView(`folders/${folderId}/notes/${noteId}`);
      if (currentNote) {
        setEditableTitleText(
          currentNote.title || currentNote.name || "Untitled Note"
        ); // Handle both title/name
        setIsEditingTitle(false);
        setHasAttemptedLoad(true);
      } else if (!isNotesListLoading) {
        // Only set to "not found" if not loading and no note
        setEditableTitleText("Note not found");
        setHasAttemptedLoad(true);
      } else if (isNotesListLoading) {
        setEditableTitleText("Loading note...");
        setHasAttemptedLoad(false);
      }
    } else {
      // Fallback if no noteId or folderId, though this layout should ideally not be reached without them.
      setActiveSidebarView(`folders/${folderId || ""}`);
      setEditableTitleText("Note not specified");
      setIsEditingTitle(false);
      setHasAttemptedLoad(true);
    }
  }, [
    folderId,
    noteId,
    currentNote,
    isNotesListLoading,
    // location.pathname, // location.pathname might cause too many re-renders if not careful
    // navigate, // navigate function itself doesn't change
    // isUpdatingThisNote, // Only relevant for after an update attempt
  ]);

  // Update editable body text when note changes
  useEffect(() => {
    if (currentNote) {
      setEditableBodyText(currentNote.body || "");
      setIsEditingBody(false);
    }
  }, [currentNote]);

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditableTitleText(event.target.value);
  };

  const handleTitleEditSubmit = async () => {
    if (!noteId || !currentNote) {
      setIsEditingTitle(false);
      return;
    }
    const currentNoteTitle = currentNote.title || currentNote.name || "";
    if (editableTitleText.trim() === currentNoteTitle) {
      setIsEditingTitle(false);
      setEditableTitleText(currentNoteTitle);
      return;
    }
    if (!editableTitleText.trim()) {
      dispatch(showSnackbar("Note title cannot be empty.", "error"));
      setEditableTitleText(currentNoteTitle); // Revert to original
      setIsEditingTitle(false);
      return;
    }

    // Assuming UpdateNoteDto for title change is { title: string } or { name: string }
    // Adjust based on your actual UpdateNoteDto structure
    const updateDto: UpdateNoteDto = { title: editableTitleText.trim() };
    // If your DTO uses 'name': const updateDto: UpdateNoteDto = { name: editableTitleText.trim() };

    try {
      await dispatch(submitNoteUpdate(noteId, updateDto));
      // Success snackbar is likely handled within submitNoteUpdate thunk
    } catch (error) {
      console.error("Failed to update note title:", error);
      setEditableTitleText(currentNoteTitle); // Revert on error
      // Error snackbar is likely handled within submitNoteUpdate thunk
    } finally {
      setIsEditingTitle(false);
    }
  };

  const handleTitleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleTitleEditSubmit();
    } else if (event.key === "Escape") {
      setIsEditingTitle(false);
      if (currentNote)
        setEditableTitleText(currentNote.title || currentNote.name || "");
    }
  };

  // Save body edit
  const handleBodyEditSubmit = async () => {
    if (!noteId || !currentNote) {
      setIsEditingBody(false);
      return;
    }
    const currentNoteBody = currentNote.body || "";
    if (editableBodyText.trim() === currentNoteBody) {
      setIsEditingBody(false);
      setEditableBodyText(currentNoteBody);
      return;
    }
    // Optionally: prevent empty body
    // if (!editableBodyText.trim()) {
    //   dispatch(showSnackbar("Note body cannot be empty.", "error"));
    //   setEditableBodyText(currentNoteBody);
    //   setIsEditingBody(false);
    //   return;
    // }
    const updateDto: UpdateNoteDto = { body: editableBodyText };
    try {
      await dispatch(submitNoteUpdate(noteId, updateDto));
    } catch (error) {
      setEditableBodyText(currentNoteBody);
    } finally {
      setIsEditingBody(false);
    }
  };

  const handleBodyKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleBodyEditSubmit();
    } else if (event.key === "Escape") {
      setIsEditingBody(false);
      if (currentNote) setEditableBodyText(currentNote.body || "");
    }
  };

  // Determine display title
  let displayTitle = "Note"; // Default
  if (folderId && noteId) {
    if (isNotesListLoading && !currentNote && !hasAttemptedLoad) {
      displayTitle = "Loading note...";
    } else if (currentNote) {
      displayTitle = currentNote.title || currentNote.name || "Untitled Note";
    } else if (!isNotesListLoading && !currentNote && hasAttemptedLoad) {
      displayTitle = "Note not found";
    }
  }

  // Get folders from Redux to display folder name in breadcrumb
  const folders = useSelector((state: RootState) => state.folders.folders);
  const currentFolder = useMemo(() => {
    if (!folderId || !folders) return null;
    return folders.find((f) => f.id === folderId);
  }, [folderId, folders]);

  // Pseudocode for your NoteDetailPage component
  // const { noteId } = useParams();
  // const note = useSelector(state => state.notes.notes.find(n => n.id === noteId));

  useEffect(() => {
    if (!currentNote && noteId) {
      dispatch(fetchUserNotes()); // You need an action for this
    }
  }, [currentNote, noteId, dispatch]);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <CssBaseline />
      <Sidebar activeView={activeSidebarView} />
      <TopBar />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          background:
            "linear-gradient(180deg, #fff 0%, rgb(200, 220, 250) 100%)",
          pt: 0,
          px: 3,
          pb: 3,
          overflowY: "auto",
        }}
      >
        <Toolbar />
        {/* Breadcrumbs */}
        <Box sx={{ my: 2 }}>
          <Breadcrumbs aria-label="breadcrumb">
            <Link
              component={RouterLink}
              underline="hover"
              color="inherit"
              to="/folders"
            >
              Folders
            </Link>
            {folderId && currentFolder && (
              <Link
                component={RouterLink}
                underline="hover"
                color="inherit"
                to={`/folders/${folderId}`}
              >
                {currentFolder.name || currentFolder.title || "Folder"}
              </Link>
            )}
            {folderId && noteId && (
              <Typography color="text.primary">{displayTitle}</Typography>
            )}
          </Breadcrumbs>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", my: 3 }}>
          {isEditingTitle && folderId && noteId && currentNote ? (
            <TextField
              value={editableTitleText}
              onChange={handleTitleChange}
              onBlur={handleTitleEditSubmit} // Submit on blur
              onKeyDown={handleTitleKeyDown}
              autoFocus
              variant="standard"
              size="small"
              sx={{
                flexGrow: 1,
                "& .MuiInputBase-input": {
                  typography: "h4", // Slightly smaller than folder title
                  fontWeight: "bold",
                  paddingBottom: "2px",
                },
              }}
              InputProps={{
                endAdornment: isUpdatingThisNote ? (
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                ) : (
                  <IconButton
                    onClick={handleTitleEditSubmit}
                    size="small"
                    edge="end"
                  >
                    <CheckIcon fontSize="small" />
                  </IconButton>
                ),
              }}
            />
          ) : (
            <Typography
              variant="h4" // Slightly smaller than folder title
              component="h1"
              sx={{
                fontWeight: "bold",
                flexGrow: 1,
                cursor:
                  folderId && noteId && currentNote ? "pointer" : "default",
              }}
              onClick={() => {
                if (folderId && noteId && currentNote) setIsEditingTitle(true);
              }}
            >
              {displayTitle}
            </Typography>
          )}
          {folderId && noteId && currentNote && !isEditingTitle && (
            <IconButton
              onClick={() => setIsEditingTitle(true)}
              size="small"
              sx={{ ml: 1 }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
        {/* Tags display */}
        {currentNote && Array.isArray(currentNote.tags) && (
          <Box sx={{ mb: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
            {currentNote.tags.map((tag: string, idx: number) => (
              <Chip
                key={tag + idx}
                label={tag}
                size="medium"
                sx={{
                  background: "#fffde7",
                  color: "#bfa700",
                  fontWeight: 500,
                  border: "1px solid #f5e9b9",
                  fontSize: "1.3rem",
                  height: "2.3em",
                }}
              />
            ))}
            {/* Add Tag Editable */}
            {currentNote && (
              <Box
                component="form"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (
                    addTagValue.trim() &&
                    !currentNote.tags.includes(addTagValue.trim())
                  ) {
                    const updateDto: UpdateNoteDto = {
                      tags: JSON.stringify([
                        ...currentNote.tags,
                        addTagValue.trim(),
                      ]),
                    };
                    dispatch(submitNoteUpdate(currentNote.id, updateDto));
                  }
                  setAddTagValue("");
                  setAddTagEditing(false);
                }}
                sx={{ display: "inline-flex", alignItems: "center" }}
              >
                {addTagEditing ? (
                  <TextField
                    value={addTagValue}
                    onChange={(e) => setAddTagValue(e.target.value)}
                    onBlur={() => {
                      setAddTagEditing(false);
                      setAddTagValue("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setAddTagEditing(false);
                        setAddTagValue("");
                      }
                    }}
                    size="small"
                    autoFocus
                    variant="outlined"
                    sx={{
                      ml: 0.5,
                      "& .MuiInputBase-root": {
                        fontSize: "1.3rem",
                        height: "2.3em",
                        background: "#fffde7",
                        borderRadius: "16px",
                        paddingLeft: "8px",
                        paddingRight: "8px",
                      },
                      width: "110px",
                    }}
                    inputProps={{
                      maxLength: 32,
                      style: { padding: "4px 8px" },
                    }}
                  />
                ) : (
                  <Chip
                    label="+ tag"
                    clickable
                    onClick={() => setAddTagEditing(true)}
                    sx={{
                      background: "#f5e9b9",
                      color: "#8d6d00",
                      fontWeight: 700,
                      border: "1.5px dashed #bfa700",
                      fontSize: "1.3rem",
                      height: "2.3em",
                      ml: 0.5,
                      cursor: "pointer",
                      "&:hover": {
                        background: "#fffde7",
                      },
                    }}
                  />
                )}
              </Box>
            )}
          </Box>
        )}
        {/* Display update error if any */}
        {updateErrorForThisNote && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to update note: {updateErrorForThisNote}
          </Alert>
        )}
        {/* Display message if note not found and not loading */}
        {!isNotesListLoading &&
          !currentNote &&
          hasAttemptedLoad &&
          folderId &&
          noteId && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              The requested note could not be found in this folder, or it may
              have been deleted.
            </Alert>
          )}
        {/* Editable note body */}
        {currentNote && !isNotesListLoading && (
          <Paper
            elevation={4}
            sx={{
              maxWidth: 800,
              mx: "auto",
              p: { xs: 2, sm: 4 },
              borderRadius: 3,
              background: "#fffbea",
              boxShadow:
                "0 2px 8px 0 rgba(0,0,0,0.10), 0 1.5px 3px 0 rgba(0,0,0,0.06)",
              minHeight: "350px",
              mt: 2,
              mb: 4,
              border: "2px solidrgb(185, 245, 245)",
              backgroundImage:
                "repeating-linear-gradient(to bottom,rgb(234, 254, 255) 0px,rgb(234, 251, 255) 32px,rgb(182, 240, 247) 33px)",
              position: "relative",
              fontFamily: "'Segoe Print', 'Comic Sans MS', cursive, sans-serif",
              overflowWrap: "break-word",
            }}
          >
            {isEditingBody ? (
              <TextField
                multiline
                fullWidth
                minRows={8}
                value={editableBodyText}
                onChange={(e) => setEditableBodyText(e.target.value)}
                onBlur={handleBodyEditSubmit}
                onKeyDown={handleBodyKeyDown}
                autoFocus
                variant="outlined"
                sx={{
                  background: "transparent",
                  "& .MuiInputBase-root": {
                    fontFamily:
                      "'Segoe Print', 'Comic Sans MS', cursive, sans-serif",
                    fontSize: "1.15rem",
                  },
                }}
                placeholder="Write your note here..."
              />
            ) : (
              <Typography
                variant="body1"
                sx={{
                  whiteSpace: "pre-line",
                  minHeight: "200px",
                  fontSize: "1.15rem",
                  color: "#5a4a00",
                  cursor: "pointer",
                  fontFamily:
                    "'Segoe Print', 'Comic Sans MS', cursive, sans-serif",
                  "&:hover": {
                    background:
                      "repeating-linear-gradient(to bottom,rgb(234, 254, 255) 0px,rgb(234, 251, 255) 32px,rgb(182, 240, 247) 33px)",
                  },
                  p: 1,
                  borderRadius: 2,
                  transition: "background 0.2s",
                }}
                onClick={() => setIsEditingBody(true)}
                title="Click to edit note body"
              >
                {currentNote.body || (
                  <span style={{ color: "#bbb" }}>
                    Click to add note content...
                  </span>
                )}
              </Typography>
            )}
          </Paper>
        )}
        {/* Show loading spinner for note content area if note list is loading and no specific note yet */}
        {isNotesListLoading && !currentNote && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "50vh",
            }}
          >
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading note content...</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default NoteLayout;
