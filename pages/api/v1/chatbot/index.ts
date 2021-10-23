import {NextApiRequest, NextApiResponse} from 'next';
import * as line from '@line/bot-sdk';
import {IResponseData} from '../../../../interfaces/responses';
import Utils from '../../../../services/utils';

const apiName = 'chatbot';
const lineConfig: line.Config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.CHANNEL_SECRET || '',
};

const client = new line.Client(lineConfig as line.ClientConfig);

type IHandler = (req: NextApiRequest, res: NextApiResponse) => void

export default (req: NextApiRequest, res: NextApiResponse) => {
  console.log(`call ${apiName} api start:`, req.url, req);
  switch (req.method) {
    case 'POST':
      return wrapHandler(req, res, postHandler, () => line.middleware(lineConfig as line.MiddlewareConfig));
  }
};

const wrapHandler = (req: NextApiRequest, res: NextApiResponse, handler: IHandler, preProcess?: () => void, postProcess?: () => void) => {
  console.log(`[INFO] Start ${apiName} API:`, Utils.getTimeStamp(), req.url, req.body, req.headers);
  preProcess && preProcess();
  handler(req, res);
  postProcess && postProcess();
  console.log(`[INFO] End ${apiName} API:`, Utils.getTimeStamp());
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

  const data: line.Message = handleMessage(event);

  return client.replyMessage(event.replyToken, makeMsgObj(event.message.text)).then(() => {
    return Promise.resolve({status: 'OK'});
  }).catch((e) => {
    console.log(`[ERROR] ${apiName} API`, Utils.getTimeStamp(), e);
    return Promise.reject(e);
  });
};

const handleMessage = (event: line.MessageEvent) => {
  const message = event.message as line.TextEventMessage;
  const text = message.text;


  return makeMsgObj('test');
};

const makeMsgObj = (text: string): line.Message => ({type: 'text', text});
