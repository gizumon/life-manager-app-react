import {NextApiRequest, NextApiResponse} from 'next';
import * as line from '@line/bot-sdk';
import {IResponseData} from '../../../../interfaces/responses';
import Utils from '../../../../services/utils';
import Chatbot, {IToBuyArgs, IOtherArgs} from '../../../../services/chatbot';
import {FirebaseService} from '../../../../services/firebase';
import { IToBuy } from '../../../../interfaces/index';
import CONST from '../../../../services/constants';

const apiName = 'chatbot';
const lineConfig: line.Config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.CHANNEL_SECRET || '',
};

const client = new line.Client(lineConfig as line.ClientConfig);
const firebase = new FirebaseService();

type IHandler = (req: NextApiRequest, res: NextApiResponse) => void

export default function ChatbotApi(req: NextApiRequest, res: NextApiResponse) {
  console.log(`call ${apiName} api start:`, req.url, req);
  switch (req.method) {
    case 'POST':
      return wrapHandler(req, res, postHandler, preProcess, postProcess);
  }
};

const wrapHandler = (req: NextApiRequest, res: NextApiResponse, handler: IHandler, preProcess?: () => void, postProcess?: () => void) => {
  console.log(`[INFO] Start ${apiName} API:`, Utils.getDateTime(), req.url, req.body, req.headers);
  preProcess && preProcess();
  handler(req, res);
  postProcess && postProcess();
  console.log(`[INFO] End ${apiName} API:`, Utils.getDateTime());
};

const preProcess = () => {
  line.middleware(lineConfig as line.MiddlewareConfig);
};

const postProcess = () => {};

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

  const data: line.Message = await handleMessage(event);

  return client.replyMessage(event.replyToken, data).then(() => {
    return Promise.resolve({status: 'OK'});
  }).catch((e) => {
    console.log(`[ERROR] ${apiName} API`, Utils.getDateTime(), e);
    return Promise.reject(e);
  });
};

const handleMessage = async (event: line.MessageEvent): Promise<line.Message> => {
  const message = event.message as line.TextEventMessage;
  const text = message.text;

  const args = Chatbot.parseText(text);
  args.lid = event.source.userId;

  let replyText = '';
  switch (args.id) {
    case 'tobuy':
      replyText = await handleToBuy(args);
    default:
      replyText = await handleOther(args);
  }

  return {
    type: 'text',
    text: replyText,
  };
};

const handleToBuy = async (args: IToBuyArgs): Promise<string> => {
  if (args.action === 'list') {
    const gid = await firebase.getGroupIdByUserId(args.lid);
    const items = gid ? await firebase.getToBuyInputs(gid) : [];

    items.sort((a, b) => {
      const catA = CONST.buyCategories.find((cat) => cat.id === a.buyCategory);
      const catB = CONST.buyCategories.find((cat) => cat.id === b.buyCategory);
      return catA.setting.order - catB.setting.order;
    });

    let content = '🐶お買い物リスト🐶\n\n';
    if (!items.length) {
      'お買い物リストが登録されてないみたいです🐾\n良かったら、Tobuyから登録してね！';
    }
    items.forEach((item, i) => {
      if (i === 0 || items[i].buyCategory !== items[i - 1].buyCategory) {
        content += `🐾 ${CONST.getCategoryNameById(item.buyCategory)}\n`;
      }
      content += `  ・${item.item}\n`;
    });

    return content;
  }
};

const handleOther = async (args: IOtherArgs): Promise<string> => {
  const hellos = ['こんにちわ', 'おはよう', 'こんばんは', 'おやすみ', 'こんばんわ'];
  const isHellos = args.words.some(word => Chatbot.isIncludesArr(word, hellos));
  if (isHellos) {
    return 'こんにちわん🐶\n今日も元気に頑張ってね！';
  }
  return 'まだ言葉を覚え中なので、上手くお返事ができないかもです。。🐶\n「お買い物」と言ってくれたら、買い物リストは表示できるよ🐾';
};
