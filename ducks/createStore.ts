import { Store, combineReducers } from 'redux';
import logger from 'redux-logger';
import { configureStore } from '@reduxjs/toolkit';
import userSlice, { initialState as userState } from './user/slice';
import firebaseSlice, { initialState as firebaseState } from './firebase/slice';
import getConfig from 'next/config';

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
const { publicRuntimeConfig } = getConfig();
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
  devTools: publicRuntimeConfig.NODE_ENV !== 'production',
  preloadedState: preloadedState(),
});
export default store;