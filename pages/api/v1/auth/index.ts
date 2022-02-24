import {NextApiHandler, NextApiRequest, NextApiResponse} from 'next';
import { wrapHandler } from '../../../../services/api';
import { postAuthHandler } from '../../../../handlers/authHandler';
import Utils from '../../../../services/utils';
import errors from '../../../../models/errorResponse';

const apiName = 'auth';

export default function AuthApi(req: NextApiRequest, res: NextApiResponse) {
  console.log(`call ${apiName} api start:`, req.method, req.url);
  switch (req.method) {
    case 'POST':
      return wrapHandler(req, res, postAuthHandler, preProcess, postProcess);
    default:
      return wrapHandler(req, res, (_, response) => {
        response.status(404).json(errors.NOT_FOUND_ERROR(`${req.url} is not found`));
      }, preProcess, postProcess);
  }
};

const preProcess: NextApiHandler = (req, _res) => {
  console.log(`[INFO]Start ${apiName} API:`, Utils.getDateTime(), req.method, req.url, req.body);
};

const postProcess: NextApiHandler = (_req, res) => {
  console.log(`[INFO]End ${apiName} API:`, Utils.getDateTime(), res.statusCode);
};
