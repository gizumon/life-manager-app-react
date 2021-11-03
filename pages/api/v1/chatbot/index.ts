import {NextApiRequest, NextApiResponse} from 'next';
import * as line from '@line/bot-sdk';
import {IResponseData} from '../../../../interfaces/responses';
import Utils from '../../../../services/utils';
import Chatbot from '../../../../services/chatbot';
import ToBuyModel from '../../../../models/tobuy';
import { ICmdKey } from '../../../../interfaces/chatbot';

const apiName = 'chatbot';
const lineConfig: line.Config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.CHANNEL_SECRET || '',
};

const client = new line.Client(lineConfig as line.ClientConfig);

type IHandler = (req: NextApiRequest, res: NextApiResponse) => void

export default function ChatbotApi(req: NextApiRequest, res: NextApiResponse) {
  console.log(`call ${apiName} api start:`, req.url);
  switch (req.method) {
    case 'POST':
      return wrapHandler(req, res, postHandler, preProcess, postProcess);
  }
};

const wrapHandler = (req: NextApiRequest, res: NextApiResponse, handler: IHandler, preProcess?: IHandler, postProcess?: IHandler) => {
  preProcess && preProcess(req, res);
  handler(req, res);
  postProcess && postProcess(req, res);
};

const preProcess = (req, _res) => {
  console.log(`[INFO] Start ${apiName} API:`, Utils.getDateTime(), req.url, req.body);
  line.middleware(lineConfig as line.MiddlewareConfig);
};

const postProcess = (_req, _res) => {
  console.log(`[INFO] End ${apiName} API:`, Utils.getDateTime());
};

const postHandler = (req: NextApiRequest, res: NextApiResponse) => {
  let resBody;
  const data = req.body as line.WebhookRequestBody;
  const events = data.events;
  events.forEach(async (event) => {
    await handleEvent(event);
  });
  res.statusCode = 200;
  res.json(resBody || {status: 'OK'});
};

const handleEvent = async (event: line.WebhookEvent): Promise<IResponseData> => {
  if (event.type !== 'message' || event.message.type !== 'text' ) {
    return Promise.resolve({status: 'Not supported'});
  }

  const lid = event.source.userId;
  const message = event.message as line.TextEventMessage;
  const text = message.text;
  console.log('[INFO] Received message: ', text);

  const cmd = Chatbot.getCmdKey(text);
  const model = getModelFromCmd(cmd, lid);
  
  await model.initialize();

  const args = model.parseText(text, event);
  const isSuccess = await model.doAction(args);
  console.log(isSuccess);

  return isSuccess ? Promise.resolve({status: 'OK'}) : Promise.reject('Failed to do actions');
};

const getModelFromCmd = (cmd: ICmdKey, lid: string) => {
  switch (cmd) {
    case 'tobuy':
      return new ToBuyModel({lid, client});
    default:
      return new ToBuyModel({lid, client});
  }
};
