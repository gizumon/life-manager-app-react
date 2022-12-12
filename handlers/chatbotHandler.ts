import * as line from '@line/bot-sdk';
import { IResponseData } from '../interfaces/responses';
import Chatbot from '../services/chatbot';
import ToBuyModel from '../models/tobuy';
import { ICmdKey } from '../interfaces/chatbot';
import { NextApiResponse } from 'next';
import { NextPostApiRequest } from '../interfaces/api';
import getConfig from 'next/config';

const { CHANNEL_ACCESS_TOKEN, CHANNEL_SECRET } = getConfig().publicRuntimeConfig;
export const lineConfig: line.Config = {
  channelAccessToken: CHANNEL_ACCESS_TOKEN || '',
  channelSecret: CHANNEL_SECRET || '',
};

const client = new line.Client(lineConfig as line.ClientConfig);

export const postChatbotHandler = (req: NextPostApiRequest<line.WebhookRequestBody>, res: NextApiResponse) => {
  let resBody;
  const data = req.body;
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
