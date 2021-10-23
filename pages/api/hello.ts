import {NextApiRequest, NextApiResponse} from 'next';
import {IResponseData} from '../../interfaces/responses';

const apiName = 'hello';

type IHandler = (req: NextApiRequest, res: NextApiResponse) => void

export default (req: NextApiRequest, res: NextApiResponse) => {
  console.log(`call ${apiName} api start:`, req.url, req);
  switch (req.method) {
    case 'GET':
      return wrapHandler(req, res, getHandler);
    case 'POST':
      return wrapHandler(req, res, postHandler);
    case 'PUT':
      return wrapHandler(req, res, putHandler);
    case 'DELETE':
      return wrapHandler(req, res, deleteHandler);
  }
};

const wrapHandler = (req: NextApiRequest, res: NextApiResponse, handler: IHandler, preProcess?: () => void, postProcess?: () => void) => {
  console.log(`[INFO] Start ${apiName} API:`, req.url, req);
  preProcess && preProcess();
  handler(req, res);
  postProcess && postProcess();
  console.log(`[INFO] End ${apiName} API:`, req.url, req);
};

const getHandler = (req: NextApiRequest, res: NextApiResponse) => {
  const data: IResponseData = {name: `${apiName}: GET`};

  res.statusCode = 200;
  res.json(data);
};

const postHandler = (req: NextApiRequest, res: NextApiResponse) => {
  const data: IResponseData = {name: `${apiName}: POST`};

  res.statusCode = 200;
  res.json(data);
};

const putHandler = (req: NextApiRequest, res: NextApiResponse) => {
  const data: IResponseData = {name: `${apiName}: PUT`};

  res.statusCode = 200;
  res.json(data);
};

const deleteHandler = (req: NextApiRequest, res: NextApiResponse) => {
  const data: IResponseData = {name: `${apiName}: DELETE`};

  res.statusCode = 200;
  res.json(data);
};
