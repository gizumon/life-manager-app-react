import { NextApiResponse } from 'next';
import { NextPostApiRequest } from '../interfaces/api';
import { FirebaseService } from '../services/firebase';
import { IMember } from '../interfaces/index';
import errors, { IErrorResponse } from '../models/errorResponse';

// id, groupId is required.
export type IPostUsersRequest = IMember;
export type IPostUserResponse = IMember;

export const postUserHandler = (req: NextPostApiRequest<IPostUsersRequest>, res: NextApiResponse<IPostUserResponse | IErrorResponse>) => {
  const apiName = 'postUser'
  const data = req.body;
  if (!data.id) {
    return res.status(400).json(errors.DB_ERROR(apiName, 'id is missing in request parameters.'));
  }
  if (!data.groupId) {
    return res.status(400).json(errors.DB_ERROR(apiName, 'group id is missing in request parameters.'));
  }
  const firebase = new FirebaseService();
  const user = {
    id: data.id,
    name: data.name,
    // lineId: data.lineId,   // should not update
    groupId: data.groupId,
    picture: data.picture,
  };
  firebase.updateMember(user).then((_) => {
    return res.json(user);
  }).catch(e => {
    console.log('[INFO]Failed to access firebase via updateMember', e);
    return res.status(500).json(errors.DB_ERROR(apiName, 'Failed to access firebase in auth handler'));
  });
};
