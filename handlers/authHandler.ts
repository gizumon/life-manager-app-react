import { NextApiRequest, NextApiResponse } from 'next';
import getConfig from 'next/config';
import { NextPostApiRequest } from '../interfaces/api';
import axios, { AxiosError } from 'axios';
import { UserState } from '../ducks/user/slice';
import { FirebaseService } from '../services/firebase';
import { IMember } from '../interfaces/index';
import errors, { IErrorResponse } from '../models/errorResponse';

export interface IAuthRequest {
  idToken: string; // firebase user id
}

export interface IAuthResponse {
  id: string;
  name: string;
  picture: string;
  groupId: string;
}

interface ILineAuthResponse {
  iss: string;
  sub: string;
  aud: string;
  exp: string;
  iat: string;
  nonce: string;
  amr: string;
  name: string;
  picture: string;
  email: string;
}

const { publicRuntimeConfig } = getConfig();
const { LINE_AUTH_ENDPOINT, LINE_AUTH_CLIENT_ID, LINE_AUTH_CLIENT_SECRET } = publicRuntimeConfig;

export const postAuthHandler = (req: NextPostApiRequest<IAuthRequest>, res: NextApiResponse<IAuthResponse | IErrorResponse>) => {
  const { idToken } = req.body;
  console.log('[INFO]Run get auth handler', idToken, LINE_AUTH_CLIENT_ID, LINE_AUTH_CLIENT_SECRET, LINE_AUTH_ENDPOINT);
  const requestForm= new URLSearchParams();
  requestForm.append('id_token', idToken);
  requestForm.append('client_id', LINE_AUTH_CLIENT_ID);
  console.log('[INFO]Send request auth handler', requestForm);
  return axios.post(LINE_AUTH_ENDPOINT, requestForm).then(async ({ data }: { data: ILineAuthResponse}) => {
    console.log('[INFO]Success auth request', data);
    const firebase = new FirebaseService();
    const userId = await firebase.getUserIdByLid(data.sub);
    let user
    console.log('[INFO]Success get user id from firebase', userId);
    if (userId) {
      const existingUser = await firebase.getUserById(userId).catch(e => {
        console.log('[INFO]Failed to access firebase via getUserByLId', e);
        return {};
      });
      user = {
        id: userId,
        name: data.name,
        picture: data.picture,
        ...existingUser,
      };
    } else {
      const newUser: IMember = {
        lineId: data.sub,
        name: data.name,
        picture: data.picture,
      };
      user = await firebase.pushMember(newUser).catch(e => {
        console.log('[INFO]Failed to access firebase via getUserByLId', e);
        return {};
      });
    }
    console.log('[INFO]Success get user from firebase', user);
    if (!user) {
      return res.status(401).json(errors.DB_ERROR('Failed to access firebase in auth handler'));
    }

    return res.json({
      id: user?.id || '',
      name: data.name,
      picture: data.picture,
      groupId: user?.groupId || '',
    });
  }).catch((e: AxiosError) =>{
    console.log('[INFO]Failed to request auth. code: ', e.code, 'message: ', e.message);
    return res.status(400).json(errors.API_ERROR('Failed to access line auth api'));
  });
};
