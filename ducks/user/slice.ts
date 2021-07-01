import { SendMessagesParams } from '@line/liff/dist/lib/api/sendMessages';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type UserState = {
  userId: string;
  displayName: string;
  pictureUrl: string;
  statusMessage: string;
  // messageSender?: (params: SendMessagesParams) => Promise<void>;
};

export const initialState: UserState = {
  userId: '',
  displayName: '',
  pictureUrl: '',
  statusMessage: ''
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (_, action: PayloadAction<UserState>) => action.payload,
  },
});

export default userSlice;