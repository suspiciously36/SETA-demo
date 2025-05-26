import type { PaginatedTeamsResponse } from '../../services/teamService.ts';
import { Team, type DetailedTeam, type UpdateTeamSuccessResponseData } from '../../types/team.types';
import { FETCH_TEAMS_REQUEST, FETCH_TEAMS_SUCCESS, FETCH_TEAMS_FAILURE, CREATE_TEAM_REQUEST, CREATE_TEAM_SUCCESS, CREATE_TEAM_FAILURE, DELETE_TEAM_REQUEST, DELETE_TEAM_SUCCESS, DELETE_TEAM_FAILURE, FETCH_TEAM_DETAILS_REQUEST, FETCH_TEAM_DETAILS_SUCCESS, FETCH_TEAM_DETAILS_FAILURE, CLEAR_TEAM_DETAILS, UPDATE_TEAM_REQUEST, UPDATE_TEAM_SUCCESS, UPDATE_TEAM_FAILURE } from '../actions/actionTypes';

export interface PaginationInfo {
    totalRecords: number;
    limit: number;
    page: number;
    offset?: number; 
    totalPages?: number; 
}

export interface TeamState {
  teams: Team[];
  loading: boolean;
  error: string | null;
  creatingLoading: boolean;
  creatingError: string | null;
  deletingLoading: Record<string, boolean>; 
  deletingError: Record<string, string | null>;
  currentTeamDetails: DetailedTeam | null;
  loadingDetails: boolean;
  errorDetails: string | null;
  updatingLoading: boolean; 
  updatingError: string | null;   

  pagination: PaginationInfo | null;
}

const initialState: TeamState = {
  teams: [],
  loading: false,
  error: null,
  creatingLoading: false,
  creatingError: null,
  deletingLoading: {},
  deletingError: {},
  currentTeamDetails: null,
  loadingDetails: false,
  errorDetails: null,
  updatingLoading: false,
  updatingError: null,

  pagination: null
};

// Define action interfaces for teams
interface FetchTeamsRequestAction { type: typeof FETCH_TEAMS_REQUEST; }
interface FetchTeamsSuccessAction { type: typeof FETCH_TEAMS_SUCCESS; payload: PaginatedTeamsResponse; }
interface FetchTeamsFailureAction { type: typeof FETCH_TEAMS_FAILURE; payload: string; }

interface CreateTeamRequestAction { type: typeof CREATE_TEAM_REQUEST; }
interface CreateTeamSuccessAction { type: typeof CREATE_TEAM_SUCCESS; payload: Team; } 
interface CreateTeamFailureAction { type: typeof CREATE_TEAM_FAILURE; payload: string; }

interface DeleteTeamRequestAction { type: typeof DELETE_TEAM_REQUEST; payload: { teamId: string }; }
interface DeleteTeamSuccessAction { type: typeof DELETE_TEAM_SUCCESS; payload: { teamId: string }; } 
interface DeleteTeamFailureAction { type: typeof DELETE_TEAM_FAILURE; payload: { teamId: string, error: string }; }

interface FetchTeamDetailsRequestAction { type: typeof FETCH_TEAM_DETAILS_REQUEST; }
interface FetchTeamDetailsSuccessAction { type: typeof FETCH_TEAM_DETAILS_SUCCESS; payload: DetailedTeam; }
interface FetchTeamDetailsFailureAction { type: typeof FETCH_TEAM_DETAILS_FAILURE; payload: string; }
interface ClearTeamDetailsAction { type: typeof CLEAR_TEAM_DETAILS; }

interface UpdateTeamRequestAction { type: typeof UPDATE_TEAM_REQUEST; payload: { teamId: string } } 
interface UpdateTeamSuccessAction { type: typeof UPDATE_TEAM_SUCCESS; payload: UpdateTeamSuccessResponseData; } 
interface UpdateTeamFailureAction { type: typeof UPDATE_TEAM_FAILURE; payload: string } 

export type TeamActionTypes = 
  | FetchTeamsRequestAction
  | FetchTeamsSuccessAction
  | FetchTeamsFailureAction
  | CreateTeamRequestAction
  | CreateTeamSuccessAction
  | CreateTeamFailureAction
  | DeleteTeamRequestAction
  | DeleteTeamSuccessAction
  | DeleteTeamFailureAction
  | FetchTeamDetailsRequestAction
  | FetchTeamDetailsSuccessAction
  | FetchTeamDetailsFailureAction
  | ClearTeamDetailsAction
  | UpdateTeamRequestAction
  | UpdateTeamSuccessAction
  | UpdateTeamFailureAction

const teamReducer = (state: TeamState = initialState, action: TeamActionTypes): TeamState => {
  switch (action.type) {
    case FETCH_TEAMS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_TEAMS_SUCCESS:
      {const newTeams = action.payload.pagination.page === 1 ? action.payload.teams : [...state.teams, ...action.payload.teams]
      const uniqueTeams = newTeams.filter((team, index, self) => index === self.findIndex((t) => t.id === team.id))
      return {
        ...state,
        loading: false,
        teams: uniqueTeams,
        pagination: {...action.payload.pagination,
                     totalPages: Math.ceil(action.payload.pagination.totalRecords / action.payload.pagination.limit)
                    },
        error: null,
      };}
    case FETCH_TEAMS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        teams: [], 
      };
      case CREATE_TEAM_REQUEST:
        return { ...state, creatingLoading: true, creatingError: null };
      case CREATE_TEAM_SUCCESS:
        return {
          ...state,
          creatingLoading: false,
          teams: [...state.teams, action.payload], 
          creatingError: null,
        };
      case CREATE_TEAM_FAILURE:
        return { ...state, creatingLoading: false, creatingError: action.payload };

        // Fetch Single Team Details
    case FETCH_TEAM_DETAILS_REQUEST:
      return { ...state, loadingDetails: true, errorDetails: null, currentTeamDetails: null };
    case FETCH_TEAM_DETAILS_SUCCESS:
      return { ...state, loadingDetails: false, currentTeamDetails: action.payload, errorDetails: null };
    case FETCH_TEAM_DETAILS_FAILURE:
      return { ...state, loadingDetails: false, errorDetails: action.payload, currentTeamDetails: null };
    case CLEAR_TEAM_DETAILS:
      return { ...state, currentTeamDetails: null, loadingDetails: false, errorDetails: null };

    // Update Team
    case UPDATE_TEAM_REQUEST:
      return { ...state, updatingLoading: true, updatingError: null };
    case UPDATE_TEAM_SUCCESS:
      const { id, team_name, total_managers, total_members } = action.payload;
      return {
        ...state,
        updatingLoading: false,
        teams: state.teams.map(team => 
          team.id === id 
            ? { 
                ...team, 
                ...(team_name && { team_name: team_name }), 
                total_managers: total_managers, 
                total_members: total_members,
   
              } 
            : team
        ),
        currentTeamDetails: state.currentTeamDetails?.id === id 
            ? { 
                ...state.currentTeamDetails, 
                ...(team_name && { team_name: team_name }),
              } as DetailedTeam
            : state.currentTeamDetails,
        updatingError: null,
      };
    case UPDATE_TEAM_FAILURE:
      return { ...state, updatingLoading: false, updatingError: action.payload };
        
    // Delete Team
    case DELETE_TEAM_REQUEST:
      return {
        ...state,
        deletingLoading: { ...state.deletingLoading, [action.payload.teamId]: true },
        deletingError: { ...state.deletingError, [action.payload.teamId]: null },
      };
    case DELETE_TEAM_SUCCESS:
      return {
        ...state,
        teams: state.teams.filter(team => team.id !== action.payload.teamId),
        deletingLoading: { ...state.deletingLoading, [action.payload.teamId]: false },
      };
    case DELETE_TEAM_FAILURE:
      return {
        ...state,
        deletingLoading: { ...state.deletingLoading, [action.payload.teamId]: false },
        deletingError: { ...state.deletingError, [action.payload.teamId]: action.payload.error },
      };
    default:
      return state;
  }
};

export default teamReducer;
