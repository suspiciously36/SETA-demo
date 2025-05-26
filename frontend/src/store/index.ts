import { applyMiddleware, createStore, type Action } from "redux";
import rootReducer from "./reducers/index.ts";
import { thunk, type ThunkAction, type ThunkDispatch } from "redux-thunk";
import { composeWithDevTools } from "@redux-devtools/extension";

const composeEnhancers = composeWithDevTools || ((...args: any[]) => args)

const store = createStore(
    rootReducer,
    composeEnhancers(applyMiddleware(thunk))
);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = ThunkDispatch<RootState, unknown, Action<string>>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

export default store;
