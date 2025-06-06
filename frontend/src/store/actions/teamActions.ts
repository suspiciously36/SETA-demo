import { getAllTeams as fetchTeamsService, createNewTeam as createTeamsService, deleteTeamById as deleteTeamService, updateExistingTeam as updateTeamService, getTeamById as fetchTeamDetailsService, type PaginatedTeamsResponse} from '../../services/teamService';
import { Team, type CreateTeamReqDto, type DetailedTeam, type UpdateTeamDto, type UpdateTeamSuccessResponseData } from '../../types/team.types';
import { AppThunk, AppDispatch, type RootState } from '../index';
import { FETCH_TEAMS_REQUEST, FETCH_TEAMS_SUCCESS, FETCH_TEAMS_FAILURE, CREATE_TEAM_REQUEST, CREATE_TEAM_SUCCESS, CREATE_TEAM_FAILURE, DELETE_TEAM_REQUEST, DELETE_TEAM_SUCCESS, DELETE_TEAM_FAILURE, FETCH_TEAM_DETAILS_REQUEST, FETCH_TEAM_DETAILS_SUCCESS, FETCH_TEAM_DETAILS_FAILURE, CLEAR_TEAM_DETAILS, UPDATE_TEAM_REQUEST, UPDATE_TEAM_SUCCESS, UPDATE_TEAM_FAILURE } from './actionTypes';

// Action Creators
export const fetchTeamsRequest = (page: number) => ({
  type: FETCH_TEAMS_REQUEST,
  payload: { page }
} as const);

export const fetchTeamsSuccess = (data: PaginatedTeamsResponse) => ({
  type: FETCH_TEAMS_SUCCESS,
  payload: {teams: data.data, pagination: data.pagination},
} as const);

export const fetchTeamsFailure = (error: string) => ({
  type: FETCH_TEAMS_FAILURE,
  payload: error,
} as const);

export const createTeamRequest = () => ({ type: CREATE_TEAM_REQUEST } as const);
export const createTeamSuccess = (team: Team) => ({ type: CREATE_TEAM_SUCCESS, payload: team } as const);
export const createTeamFailure = (error: string) => ({ type: CREATE_TEAM_FAILURE, payload: error } as const);

export const deleteTeamRequest = (teamId: string) => ({ type: DELETE_TEAM_REQUEST, payload: { teamId } } as const);
export const deleteTeamSuccess = (teamId: string) => ({ type: DELETE_TEAM_SUCCESS, payload: { teamId } } as const);
export const deleteTeamFailure = (teamId: string, error: string) => ({ type: DELETE_TEAM_FAILURE, payload: { teamId, error } } as const);

export const fetchTeamDetailsRequest = () => ({ type: FETCH_TEAM_DETAILS_REQUEST } as const);
export const fetchTeamDetailsSuccess = (teamDetails: DetailedTeam) => ({ type: FETCH_TEAM_DETAILS_SUCCESS, payload: teamDetails } as const);
export const fetchTeamDetailsFailure = (error: string) => ({ type: FETCH_TEAM_DETAILS_FAILURE, payload: error } as const);
export const clearTeamDetails = () => ({ type: CLEAR_TEAM_DETAILS } as const);

export const updateTeamRequest = (teamId: string) => ({ type: UPDATE_TEAM_REQUEST, payload: {teamId} } as const); 
export const updateTeamSuccess = (updatedTeamData: UpdateTeamSuccessResponseData) => ({ 
    type: UPDATE_TEAM_SUCCESS, 
    payload: updatedTeamData 
} as const);
export const updateTeamFailure = (error: string) => ({ type: UPDATE_TEAM_FAILURE, payload: error } as const); 

export const fetchTeams = (page: number = 1, limit: number = 10): AppThunk => async (dispatch: AppDispatch) => {
  dispatch(fetchTeamsRequest(page));
  try {
    const teams = await fetchTeamsService(page, limit);
    dispatch(fetchTeamsSuccess(teams));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while fetching teams.';
    dispatch(fetchTeamsFailure(errorMessage));
    throw error; 
  }
};

export const createTeam = (teamData: CreateTeamReqDto): AppThunk<Promise<Team | void>> => async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(createTeamRequest());
  try {
    const newTeam = await createTeamsService(teamData);
    dispatch(createTeamSuccess(newTeam));
    const currentLimit = await getState().teams.pagination?.limit || 9;
    dispatch(fetchTeams(1, currentLimit))
    return newTeam; 
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while creating the team.';
    dispatch(createTeamFailure(errorMessage));
    throw error; 
  }
}

export const deleteTeam = (teamId: string, currentPage: number, limit: number): AppThunk<Promise<void>> => async (dispatch: AppDispatch) => {
  dispatch(deleteTeamRequest(teamId));
  try {
    await deleteTeamService(teamId);
    dispatch(deleteTeamSuccess(teamId));
    dispatch(fetchTeams(currentPage, limit))
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while deleting the team.';
    dispatch(deleteTeamFailure(teamId, errorMessage));
    throw error; 
  }
};

export const fetchTeamForEdit = (teamId: string): AppThunk<Promise<DetailedTeam | void>> => async (dispatch: AppDispatch) => {
  dispatch(fetchTeamDetailsRequest());
  try {
    const teamDetails = await fetchTeamDetailsService(teamId);
    dispatch(fetchTeamDetailsSuccess(teamDetails));
    return teamDetails;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while fetching team details.';
    dispatch(fetchTeamDetailsFailure(errorMessage));
    throw error; 
  }
};

export const submitTeamUpdate = (teamId: string, teamData: UpdateTeamDto): AppThunk<Promise<UpdateTeamSuccessResponseData | void>> => 
  async (dispatch: AppDispatch) => {
  dispatch(updateTeamRequest(teamId));
  try {
    const updatedTeamSummary = await updateTeamService(teamId, teamData); 

    dispatch(updateTeamSuccess(updatedTeamSummary));

    return updatedTeamSummary; 
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while updating the team.';
    dispatch(updateTeamFailure(errorMessage)); 
    throw error; 
  }
};
