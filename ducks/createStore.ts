import { Store, combineReducers } from 'redux';
import logger from 'redux-logger';
import { configureStore } from '@reduxjs/toolkit';
import userSlice, { initialState as userState } from './user/slice';
import firebaseSlice, { initialState as firebaseState } from './firebase/slice';

const rootReducer = combineReducers({
  user: userSlice.reducer,
  firebase: firebaseSlice.reducer,
});

const preloadedState = () => {
  return {
      user: userState,
      firebase: firebaseState,
    };
};

export type StoreState = ReturnType<typeof preloadedState>;

export type ReduxStore = Store<StoreState>;

// const middlewareList = [...getDefaultMiddleware(), logger];
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
  devTools: process.env.NODE_ENV !== 'production',
  preloadedState: preloadedState(),
});
export default store;