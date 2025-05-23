import { applyMiddleware, createStore, type Action } from "redux";
import rootReducer from "./reducers/index.ts";
import { thunk, type ThunkAction, type ThunkDispatch } from "redux-thunk";
import { composeWithDevTools } from "@redux-devtools/extension";

const composeEnhancers = composeWithDevTools || ((...args: any[]) => args)

const store = createStore(
    rootReducer,
    composeEnhancers(applyMiddleware(thunk))
);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Typed dispatch for thunks
export type AppDispatch = ThunkDispatch<RootState, unknown, Action<string>>;
// Basic Thunk Action Type
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown, // for extraArgument
  Action<string>
>;

export default store;
