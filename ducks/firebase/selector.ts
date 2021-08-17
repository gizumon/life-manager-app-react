import { useSelector } from 'react-redux';
import { FirebaseState } from './slice';

export const useFirebaseState = () => {
  return useSelector((state: { firebaseData: FirebaseState }) => state);
};