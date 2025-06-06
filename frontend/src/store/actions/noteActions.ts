import type { CreateNoteDto, DetailedNote, Note, UpdateNoteDto } from "../../types/note.types.ts"
import type { AppDispatch, AppThunk } from "../index.ts"
import { CREATE_NOTES_FAILURE, CREATE_NOTES_REQUEST, CREATE_NOTES_SUCCESS, DELETE_NOTE_FAILURE, DELETE_NOTE_REQUEST, DELETE_NOTE_SUCCESS, FETCH_NOTE_DETAILS_FAILURE, FETCH_NOTE_DETAILS_REQUEST, FETCH_NOTE_DETAILS_SUCCESS, FETCH_NOTES_FAILURE, FETCH_NOTES_REQUEST, FETCH_NOTES_SUCCESS, UPDATE_NOTE_FAILURE, UPDATE_NOTE_REQUEST, UPDATE_NOTE_SUCCESS } from "./actionTypes.ts"
import { showSnackbar } from "./notificationActions.ts"
import { 
    getAllUserNotes as fetchNotesService,
    createNewNote as createNoteService,
    updateExistingNote as updateNoteService,
    deleteExistingNote as deleteNoteService,
    type PaginatedNoteResponse,
    fetchNoteDetailsService
} from '../../services/noteService'; 

export const fetchNotesRequest = (page: number) => ({
    type: FETCH_NOTES_REQUEST,
    payload: { page }
} as const)

export const fetchNotesSuccess = (data: PaginatedNoteResponse) => ({
    type: FETCH_NOTES_SUCCESS,
    payload: { notes: data.data, pagination: data.pagination }
} as const)

export const fetchNotesFailure = (error: string) => ({
    type: FETCH_NOTES_FAILURE,
    payload: error
} as const)

export const createNotesRequest = () => ({
    type: CREATE_NOTES_REQUEST,
} as const)

export const createNotesSuccess = (note: Note) => ({
    type: CREATE_NOTES_SUCCESS,
    payload: note
} as const)

export const createNotesFailure = (error: string) => ({
    type: CREATE_NOTES_FAILURE,
    payload: error
} as const)

export const updateNoteRequest = (noteId: string) => ({
    type: UPDATE_NOTE_REQUEST,
    payload: { noteId }
} as const)

export const updateNoteSuccess = (noteId: string, changes: UpdateNoteDto) => ({
    type: UPDATE_NOTE_SUCCESS,
    payload: { id: noteId, changes }
} as const)

export const updateNoteFailure = (error: string) => ({
    type: UPDATE_NOTE_FAILURE,
    payload: error
} as const)

export const fetchNoteDetailsRequest = () => ({
     type: FETCH_NOTE_DETAILS_REQUEST 
} as const);

export const fetchNoteDetailsSuccess = (note: DetailedNote) => ({ 
    type: FETCH_NOTE_DETAILS_SUCCESS, payload: note 
} as const);

export const fetchNoteDetailsFailure = (error: string) => ({ 
    type: FETCH_NOTE_DETAILS_FAILURE, payload: error 
} as const);

export const deleteNoteRequest = (noteId: string) => ({
    type: DELETE_NOTE_REQUEST,
    payload: { noteId }
} as const)

export const deleteNoteSuccess = (noteId: string) => ({
    type: DELETE_NOTE_SUCCESS,
    payload: { noteId }
} as const)

export const deleteNoteFailure = (noteId: string, error: string) => ({
    type: DELETE_NOTE_FAILURE,
    payload: { noteId, error }
} as const)

export const fetchUserNotes = (page: number = 1, limit: number = 10): AppThunk => async (dispatch: AppDispatch) => {
    dispatch(fetchNotesRequest(page));
    try {
        const notes = await fetchNotesService(page, limit)
        dispatch(fetchNotesSuccess(notes))
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error has occurred while fetching notes";
        dispatch(fetchNotesFailure(errorMessage))
        dispatch(showSnackbar(errorMessage, "error"))
    }
}

export const submitNewNote = (folderId: string, noteData: CreateNoteDto): AppThunk => async (dispatch: AppDispatch) => {
    dispatch(createNotesRequest());
    try {
        const newNote = await createNoteService(folderId, noteData)
        dispatch(createNotesSuccess(newNote))
        dispatch(showSnackbar(`Note created successfully!`, "success"));
        return newNote;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error has occurred while creating new note";
        dispatch(createNotesFailure(errorMessage))
        dispatch(showSnackbar(errorMessage, "error"))
        throw error;
    }
}

export const submitNoteUpdate = (noteId: string, noteData: UpdateNoteDto): AppThunk<Promise<void>> => async (dispatch: AppDispatch) => {
  dispatch(updateNoteRequest(noteId));
  try {
    await updateNoteService(noteId, noteData);

    dispatch(updateNoteSuccess(noteId, noteData));
    dispatch(showSnackbar(`Note updated successfully!`, "success"));

    await dispatch(fetchUserNotes()); 

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while updating the note.';
    dispatch(updateNoteFailure(errorMessage)); 
    dispatch(showSnackbar(errorMessage, "error"));
    throw error;
  }
}

export const deleteNote = (noteId: string): AppThunk<Promise<void>> => async (dispatch: AppDispatch) => {
    dispatch(deleteNoteRequest(noteId));
    try {
        await deleteNoteService(noteId);
        dispatch(deleteNoteSuccess(noteId));

        dispatch(showSnackbar(`Note deleted successfully!`, "success"))

        await dispatch(fetchUserNotes())
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while updating the team.';
        dispatch(showSnackbar(errorMessage, "error"));
        dispatch(updateNoteFailure(errorMessage)); 
        throw error;
    }
}

export const fetchNoteDetails = (noteId: string): AppThunk<Promise<void>> => async (dispatch: AppDispatch) => {
    dispatch(fetchNoteDetailsRequest());
    try {
        const noteDetails = await fetchNoteDetailsService(noteId);
        dispatch(fetchNoteDetailsSuccess(noteDetails));
        return noteDetails;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while fetching note details.';
        dispatch(fetchNoteDetailsFailure(errorMessage));
        dispatch(showSnackbar(errorMessage, "error"));
    }
}
