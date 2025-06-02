import type { PaginatedNoteResponse } from "../../services/noteService.ts";
import type { Folder } from "../../types/folder.types.ts";
import type { DetailedNote, Note } from "../../types/note.types.ts";
import { CREATE_NOTES_FAILURE, CREATE_NOTES_REQUEST, CREATE_NOTES_SUCCESS, DELETE_NOTE_FAILURE, DELETE_NOTE_REQUEST, DELETE_NOTE_SUCCESS, FETCH_NOTE_DETAILS_FAILURE, FETCH_NOTE_DETAILS_REQUEST, FETCH_NOTE_DETAILS_SUCCESS, FETCH_NOTES_FAILURE, FETCH_NOTES_REQUEST, FETCH_NOTES_SUCCESS, UPDATE_NOTE_FAILURE, UPDATE_NOTE_REQUEST, UPDATE_NOTE_SUCCESS } from "../actions/actionTypes.ts";
import type { PaginationInfo } from "./teamReducer.ts";

export interface NoteState {
    notes: Note[];
    loading: boolean;
    error: string | null;
    creatingLoading: boolean;
    creatingError: string | null;
    updatingLoading: boolean;
    updatingError: string | null;
    deletingLoading: boolean;
    deletingError: string | null;
    currentNoteDetails: DetailedNote | null;
    loadingDetails: boolean;
    errorDetails: string | null;

    pagination: PaginationInfo | null
}

const initialState: NoteState = {
    notes: [],
    loading: false,
    error: null,
    creatingLoading: false,
    creatingError: null,
    updatingLoading: false,
    updatingError: null,
    deletingLoading: false,
    deletingError: null,
    currentNoteDetails: null,
    loadingDetails: false,
    errorDetails: null,

    pagination: null
}

interface FetchNotesRequestAction { type: typeof FETCH_NOTES_REQUEST; }
interface FetchNotesSuccessAction { type: typeof FETCH_NOTES_SUCCESS; payload: PaginatedNoteResponse }
interface FetchNotesFailureAction { type: typeof FETCH_NOTES_FAILURE; payload: string; }

interface CreateNotesRequestAction { type: typeof CREATE_NOTES_REQUEST; }
interface CreateNotesSuccessAction { type: typeof CREATE_NOTES_SUCCESS; payload: Note; }
interface CreateNotesFailureAction { type: typeof CREATE_NOTES_FAILURE; payload: string; }

interface UpdateNoteRequestAction { type: typeof UPDATE_NOTE_REQUEST; }
interface UpdateNoteSuccessAction { type: typeof UPDATE_NOTE_SUCCESS; payload: Folder; }
interface UpdateNoteFailureAction { type: typeof UPDATE_NOTE_FAILURE; payload: string; }

interface DeleteNoteRequestAction { type: typeof DELETE_NOTE_REQUEST; }
interface DeleteNoteSuccessAction { type: typeof DELETE_NOTE_SUCCESS; payload: Folder; }
interface DeleteNoteFailureAction { type: typeof DELETE_NOTE_FAILURE; payload: string; }

interface FetchNoteDetailsRequestAction { type: typeof FETCH_NOTE_DETAILS_REQUEST; }
interface FetchNoteDetailsSuccessAction { type: typeof FETCH_NOTE_DETAILS_SUCCESS; payload: DetailedNote }
interface FetchNoteDetailsFailureAction { type: typeof FETCH_NOTE_DETAILS_FAILURE; payload: string; }

export type NoteActionTypes = FetchNotesRequestAction 
| FetchNotesSuccessAction 
| FetchNotesFailureAction 
| CreateNotesRequestAction 
| CreateNotesSuccessAction 
| CreateNotesFailureAction 
| UpdateNoteRequestAction 
| UpdateNoteSuccessAction 
| UpdateNoteFailureAction
| DeleteNoteRequestAction
| DeleteNoteSuccessAction
| DeleteNoteFailureAction
| FetchNoteDetailsRequestAction
| FetchNoteDetailsSuccessAction
| FetchNoteDetailsFailureAction

const noteReducer = (state: NoteState = initialState, action: NoteActionTypes): NoteState => {
    switch (action.type) {
        case FETCH_NOTES_REQUEST:
            return { ...state, loading: true, error: null }
        case FETCH_NOTES_SUCCESS: {
            const newNotes = action.payload.pagination.currentPage === 1 ? action.payload.notes : [...state.notes, ...action.payload.notes]
            const uniqueNotes = newNotes.filter((note, index, self) => index === self.findIndex((n) => n.id === note.id))
            return {
                ...state,
                loading: false,
                error: null,
                notes: uniqueNotes,
                pagination: {
                    ...action.payload.pagination,
                    totalPages: Math.ceil(action.payload.pagination.totalRecords / action.payload.pagination.limit)
                }
            };
        }
        case FETCH_NOTES_FAILURE:
            return { ...state, loading: false, error: action.payload, notes: [] }
        
        case CREATE_NOTES_REQUEST:
            return { ...state, loading: true, error: null }
        case CREATE_NOTES_SUCCESS:
            return { ...state, creatingLoading: false, creatingError: null, notes: [action.payload, ...state.notes]}
        case CREATE_NOTES_FAILURE:
            return { ...state, creatingLoading: false, creatingError: action.payload }
        
        case UPDATE_NOTE_REQUEST:
            return { ...state, updatingLoading: true, error: null }
        case UPDATE_NOTE_SUCCESS:
            return { ...state, updatingLoading: false, updatingError: null, notes: state.notes.map(note =>
                    note.id === action.payload.id
                    ? { ...note, ...(action.payload.changes.name && { name: action.payload.changes.name }), updatedAt: new Date().toISOString() }
                    : note)}
        case UPDATE_NOTE_FAILURE:
            return { ...state, updatingLoading: false, updatingError: action.payload }

        case FETCH_NOTE_DETAILS_REQUEST:
            return { ...state, loadingDetails: true, errorDetails: null, currentNoteDetails: null };
        case FETCH_NOTE_DETAILS_SUCCESS:
            return { ...state, loadingDetails: false, currentNoteDetails: action.payload, errorDetails: null };
        case FETCH_NOTE_DETAILS_FAILURE:
            return { ...state, loadingDetails: false, errorDetails: action.payload, currentNoteDetails: null };

        case DELETE_NOTE_REQUEST:
            return { ...state, deletingLoading: true, deletingError: null }
        case DELETE_NOTE_SUCCESS:
            return { ...state, deletingLoading: false, deletingError: null, notes: state.notes.filter(note => note.id !== action.payload.id) }
        case DELETE_NOTE_FAILURE:
            return { ...state, deletingLoading: false, deletingError: action.payload }
            
    default:
        return state;
    }
}

export default noteReducer;
