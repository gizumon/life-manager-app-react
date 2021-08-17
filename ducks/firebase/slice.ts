import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IFirebaseDataStates } from '../../hooks/useFirebase';

export type FirebaseState = IFirebaseDataStates;
export const initialState: FirebaseState = {
  isRunInitialized: false, 
  isInitialized: false,
  isGroupActivated: false,
  groups: [],
  groupMembers: [],
  configs: [],
  categories: [],
  inputs:  {
    pay: [],
    todo: [],
    tobuy:[]
  }
};

const firebaseSlice = createSlice({
  name: 'firebase',
  initialState,
  reducers: {
    setFirebase: (_, action: PayloadAction<FirebaseState>) => action.payload,
  },
});

export const { setFirebase } = firebaseSlice.actions;
export default firebaseSlice;