import {NextApiRequest, NextApiResponse} from 'next';
import { wrapHandler } from '../../../../services/api';
import Utils from '../../../../services/utils';
import errors from '../../../../models/errorResponse';
import { postUserHandler } from '../../../../handlers/userHandler';

const apiName = 'user';

export default function UsersApi(req: NextApiRequest, res: NextApiResponse) {
  console.log(`call ${apiName} api start:`, req.url);
  switch (req.method) {
    // case 'GET':
    //   return wrapHandler(req, res, getUserHandler, preProcess, postProcess);
    case 'POST':
      return wrapHandler(req, res, postUserHandler, preProcess, postProcess);
    default:
      return wrapHandler(req, res, (_, response) => {
        response.status(405).json(errors.NOT_FOUND_ERROR(apiName, `${req.method} ${req.url} is not found`));
      }, preProcess, postProcess);
  }
};

const preProcess = (req, _res) => {
  console.log(`[INFO]Start ${apiName} API:`, Utils.getDateTime(), req.url, req.body);
};

const postProcess = (_req, _res) => {
  console.log(`[INFO]End ${apiName} API:`, Utils.getDateTime());
};
