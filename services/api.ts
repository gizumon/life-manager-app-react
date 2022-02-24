import { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import axios, { AxiosInstance } from 'axios';
import getConfig from 'next/config';
import { IAuthRequest, IAuthResponse } from '../handlers/authHandler';
import { IPostUserResponse, IPostUsersRequest } from '../handlers/userHandler';

const { publicRuntimeConfig } = getConfig();
const { ROOT_URL } = publicRuntimeConfig;

export const wrapHandler = (
  req: NextApiRequest,
  res: NextApiResponse,
  handler: NextApiHandler,
  preProcess?: NextApiHandler,
  postProcess?: NextApiHandler,
) => {
  preProcess && preProcess(req, res);
  handler(req, res);
  postProcess && postProcess(req, res);
};

export default class InternalAPI {
  client: AxiosInstance;
  constructor () {
    this.client = axios.create({
      baseURL: ROOT_URL,
    });
  }

  private readonly apiUrl = {
    auth: 'api/v1/auth',
    user: 'api/v1/user',
  }

  public postAuth = (data: IAuthRequest): Promise<{ data: IAuthResponse }> => this.client.post(this.apiUrl.auth, data);
  public postUser = (data: IPostUsersRequest): Promise<{ data: IPostUserResponse }> => this.client.post(this.apiUrl.user, data);
}

