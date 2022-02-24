import { NextApiRequest, NextApiResponse } from 'next';

export interface NextPostApiRequest<T> extends NextApiRequest {
  body: T;
};

