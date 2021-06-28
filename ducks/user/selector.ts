import { useSelector } from 'react-redux';
import { UserState } from './slice';

export const useUserState = () => {
  return useSelector((state: { user: UserState }) => state);
};