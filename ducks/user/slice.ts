import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IAuthResponse } from '../../handlers/authHandler';

export type UserState = IAuthResponse & { picture: string };
export const initialState: UserState = {
  id: '',
  // lineId: '', // not store for security
  name: '',
  picture: '',
  groupId: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (_, action: PayloadAction<UserState>) => action.payload,
  },
});

export const { setUser } = userSlice.actions;
export default userSlice;