import {NextApiRequest, NextApiResponse} from 'next';
import * as line from '@line/bot-sdk';
import { wrapHandler } from '../../../../services/api';
import { lineConfig, postChatbotHandler } from '../../../../handlers/chatbotHandler';
import Utils from '../../../../services/utils';
import errors from '../../../../models/errorResponse';

const apiName = 'chatbot';

// reply line message
export default function ChatbotApi(req: NextApiRequest, res: NextApiResponse) {
  console.log(`call ${apiName} api start:`, req.url);
  switch (req.method) {
    case 'POST':
      return wrapHandler(req, res, postChatbotHandler, preProcess, postProcess);
    default:
      return wrapHandler(req, res, (_, response) => {
        response.status(405).json(errors.NOT_FOUND_ERROR(apiName, `${req.method} ${req.url} is not found`));
      }, preProcess, postProcess);
  }
};

const preProcess = (req, _res) => {
  console.log(`[INFO]Start ${apiName} API:`, Utils.getDateTime(), req.url, req.body);
  line.middleware(lineConfig as line.MiddlewareConfig);
};

const postProcess = (_req, _res) => {
  console.log(`[INFO]End ${apiName} API:`, Utils.getDateTime());
};
