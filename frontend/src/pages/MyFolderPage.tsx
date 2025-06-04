import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store/index.ts";
import { UserRole } from "../types/user.types.ts";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  fetchUserNotes,
  deleteNote,
  submitNewNote,
  fetchNoteDetails, // <-- Add this import
} from "../store/actions/noteActions.ts";
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  IconButton,
  Tooltip,
  Typography,
  Chip,
  Button,
} from "@mui/material";
import type { Note } from "../types/note.types.ts";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useParams, useNavigate } from "react-router-dom";
import { showSnackbar } from "../store/actions/notificationActions.ts";
import ShareFolderDialog from "./ShareFolderDialog.tsx";
import { FolderAccessLevel, type Folder } from "../types/folder.types.ts";

const ITEMS_PER_PAGE = 10;

const MyFolderPage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { folderId } = useParams<{ folderId: string }>();
  const navigate = useNavigate();

  const { notes, loading, error, pagination, deletingLoading, deletingError } =
    useSelector((state: RootState) => state.notes);

  const { folders } = useSelector((state: RootState) => state.folders);

  const loggedInUser = useSelector((state: RootState) => state.auth.user);

  // Only ROOT or folder owner can delete notes
  const canDeleteNotes = (note: Note) => {
    if (!loggedInUser || !currentFolder) return false;
    return loggedInUser.id === currentFolder.owner_id;
  };

  // Owner and users with write access can open/edit notes
  const canOpenNote = () => {
    if (!loggedInUser || !currentFolder) return false;
    return (
      loggedInUser.id === currentFolder.owner_id ||
      currentFolder.access_level === "write"
    );
  };

  const [highlightedNoteId, setHighlightedNoteId] = useState<string | null>(
    null
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const [shareOpen, setShareOpen] = useState(false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  // Filter notes by folderId from URL
  const notesInFolder = notes.filter(
    (note) => (note.folderId || note.folder_id) === folderId
  );

  // Infinite scroll fetch logic
  const fetchNextPage = useCallback(async () => {
    if (
      !isFetchingMore &&
      !loading &&
      pagination &&
      pagination.currentPage < pagination.totalPages
    ) {
      setIsFetchingMore(true);
      dispatch(
        fetchUserNotes(pagination.currentPage + 1, ITEMS_PER_PAGE)
      ).finally(() => setIsFetchingMore(false));
    }
  }, [dispatch, isFetchingMore, loading, pagination]);

  useEffect(() => {
    if (!sentinelRef.current) return;

    observer.current?.disconnect();

    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      {
        root: null,
        rootMargin: "100px",
        threshold: 1.0,
      }
    );

    observer.current.observe(sentinelRef.current);

    return () => observer.current?.disconnect();
  }, [fetchNextPage]);

  useEffect(() => {
    // Initial fetch or folder change
    setCurrentPage(1);
    dispatch(fetchUserNotes(1, ITEMS_PER_PAGE));
  }, [dispatch, folderId]);

  const handleDeleteNote = async (note: Note) => {
    if (!canDeleteNotes(note)) return;
    if (
      window.confirm(
        `Are you sure you want to delete the note "${note.title}"? This action cannot be undone.`
      )
    ) {
      try {
        await dispatch(deleteNote(note.id, currentPage, ITEMS_PER_PAGE));
        dispatch(
          showSnackbar(`Note "${note.title}" deleted successfully.`, "success")
        );
        // Optionally handle pagination after deletion
      } catch (e: any) {
        dispatch(
          showSnackbar(
            e.message || `Failed to delete note "${note.title}".`,
            "error"
          )
        );
      }
    }
  };

  const handleCreateNote = async () => {
    if (!folderId) return;
    try {
      const newNote = {
        title: "Untitled Note",
        body: "",
        folderId,
        tags: [],
      };
      await dispatch(submitNewNote(folderId, newNote));
    } catch (e: any) {
      dispatch(showSnackbar(e.message || "Failed to create note.", "error"));
    }
  };

  const handleCardClick = async (noteId: string) => {
    setHighlightedNoteId(noteId === highlightedNoteId ? null : noteId);
    if (folderId && noteId) {
      // Fetch note details before navigating
      const folder = folders.find((f: Folder) => f.id === folderId);
      const isShared =
        folder &&
        (folder.access_level === FolderAccessLevel.READ ||
          folder.access_level === FolderAccessLevel.WRITE);
      await dispatch(fetchNoteDetails(noteId));
      if (isShared) {
        console.log(
          "Navigating here",
          `/shared-folders/${folderId}/notes/${noteId}`
        );
        navigate(`/shared-folders/${folderId}/notes/${noteId}`);
      } else {
        navigate(`/folders/${folderId}/notes/${noteId}`);
      }
    }
  };

  // Find the current folder object
  const currentFolder = folders.find((f) => f.id === folderId);

  // Determine if user can create notes
  const canCreateNote =
    currentFolder &&
    (loggedInUser.id === currentFolder.owner_id ||
      currentFolder.access_level === "write" ||
      loggedInUser.role === UserRole.ROOT);

  if (
    loading &&
    currentPage === 1 &&
    (!notesInFolder || notesInFolder.length === 0)
  ) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading notes...</Typography>
      </Box>
    );
  }

  if (
    error &&
    (!notesInFolder || notesInFolder.length === 0) &&
    currentPage === 1
  ) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Error fetching notes: {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Typography
          variant="h4"
          component="h2"
          sx={{ fontWeight: "400", color: "#666" }}
        >
          Notes List
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          {currentFolder && loggedInUser.id === currentFolder.owner_id && (
            <IconButton
              onClick={() => setShareOpen(true)}
              sx={{
                ml: 2,
                backgroundColor: "#fff",
                border: "1.5px solid #3070c4",
                borderRadius: "24px",
                minWidth: "120px",
                padding: "10px 20px",
                fontWeight: "bold",
                fontSize: "16px",
                color: "#3070c4",
                "&:hover": {
                  backgroundColor: "#e3f2fd",
                },
              }}
            >
              Share
            </IconButton>
          )}
          {canCreateNote && (
            <IconButton
              // Change to Button for consistent style with "+New Team"
              component="button"
              onClick={handleCreateNote}
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
                ml: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <AddIcon sx={{ fontSize: 22, mr: 1 }} />
              NEW NOTE
            </IconButton>
          )}
        </Box>
        <ShareFolderDialog
          isOpen={shareOpen}
          onClose={() => setShareOpen(false)}
          folderId={folderId || ""}
          folderName={currentFolder ? currentFolder.name : ""}
        />
      </Box>
      {(!notesInFolder || notesInFolder.length === 0) && !loading && !error ? (
        <Alert severity="info" sx={{ m: 2 }}>
          No notes found in this folder. Add a new note using the sidebar.
        </Alert>
      ) : (
        <Grid container spacing={5}>
          {notesInFolder.map((note: Note) => {
            const isDeleting = deletingLoading && deletingLoading[note.id];
            const deleteErrorForThisNote =
              deletingError && deletingError[note.id];
            return (
              <Grid item xs={12} sm={6} md={4} lg={4} xl={4} key={note.id}>
                <Card
                  onClick={() =>
                    !isDeleting && canOpenNote() && handleCardClick(note.id)
                  }
                  sx={{
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    minHeight: "333px",
                    cursor: isDeleting ? "default" : "pointer",
                    opacity: isDeleting ? 0.7 : 1,
                    border:
                      note.id === highlightedNoteId
                        ? "2px solidrgb(185, 233, 245)"
                        : "2px solidrgb(185, 245, 245)",
                    backgroundColor: "#fffbea",
                    backgroundImage:
                      "repeating-linear-gradient(to bottom,rgb(234, 254, 255) 0px,rgb(234, 251, 255) 32px,rgb(182, 240, 247) 33px)",
                    backgroundSize: "100% 33px",
                    transition:
                      "box-shadow 0.2s, transform 0.2s, border-color 0.2s, opacity 0.2s",
                    "&:hover": {
                      transform: isDeleting ? "none" : "translateY(-2px)",
                      boxShadow: isDeleting
                        ? "0 2px 8px rgba(0,0,0,0.07)"
                        : "0 4px 16px rgba(0,0,0,0.13)",
                      borderColor: "#f7e9b6",
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      flexGrow: 1,
                      p: 2,
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={1.5}
                    >
                      <Box
                        sx={{
                          flexGrow: 1,
                          minWidth: 0,
                          pr: 1,
                          overflow: "hidden",
                        }}
                      >
                        <Typography
                          variant="h6"
                          component="div"
                          title={note.title}
                          sx={{
                            fontWeight: "bold",
                            color:
                              note.id === highlightedNoteId
                                ? "rgba(48, 112, 196, 0.95)"
                                : "text.primary",
                            fontSize: "1.1rem",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            width: "100%",
                          }}
                        >
                          {note.title}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          flexShrink: 0,
                        }}
                      >
                        {canDeleteNotes(note) && (
                          <Tooltip
                            title={isDeleting ? "Deleting..." : "Delete Note"}
                          >
                            <span>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNote(note);
                                }}
                                disabled={isDeleting}
                                sx={{
                                  color:
                                    note.id === highlightedNoteId
                                      ? "#5e35b1"
                                      : "text.secondary",
                                  "&:hover": {
                                    backgroundColor: "action.hover",
                                  },
                                }}
                              >
                                {isDeleting ? (
                                  <CircularProgress size={16} color="inherit" />
                                ) : (
                                  <DeleteIcon
                                    fontSize="small"
                                    sx={{ color: "indianred" }}
                                  />
                                )}
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>
                    {deleteErrorForThisNote && (
                      <Alert
                        severity="error"
                        variant="outlined"
                        sx={{ fontSize: "0.75rem", p: "0px 8px", mb: 1 }}
                      >
                        {deleteErrorForThisNote}
                      </Alert>
                    )}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 1,
                        fontSize: "1rem",
                        whiteSpace: "pre-line",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxHeight: "4.5em",
                        lineClamp: 6,
                        display: "-webkit-box",
                        WebkitLineClamp: 6,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {note.body}
                    </Typography>
                    {/* Tags at bottom right */}
                    {Array.isArray(note.tags) && note.tags.length > 0 && (
                      <Box
                        sx={{
                          position: "absolute",
                          right: 8,
                          bottom: 8,
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 0.5,
                          justifyContent: "flex-end",
                        }}
                      >
                        {note.tags.map((tag: string, idx: number) => (
                          <Chip
                            key={tag + idx}
                            label={tag}
                            size="small"
                            sx={{
                              background: "#fffde7",
                              color: "#bfa700",
                              fontWeight: 500,
                              border: "1px solid #f5e9b9",
                              fontSize: "0.95rem",
                              height: "1.8em",
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
      {pagination && pagination.currentPage < pagination.totalPages && (
        <Box
          ref={sentinelRef}
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 4,
          }}
        >
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default MyFolderPage;
