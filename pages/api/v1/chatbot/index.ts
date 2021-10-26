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
  console.log(`call ${apiName} api start:`, req.url, firebase.app);
  switch (req.method) {
    case 'POST':
      return wrapHandler(req, res, postHandler, preProcess, postProcess);
  }
};

const wrapHandler = (req: NextApiRequest, res: NextApiResponse, handler: IHandler, preProcess?: () => void, postProcess?: () => void) => {
  console.log(`[INFO] Start ${apiName} API:`, Utils.getDateTime(), req.url, req.body);
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
  console.log('[INFO] Received message: ', text);

  const args = Chatbot.parseText(text);
  args.lid = event.source.userId;

  let replyText = '';
  switch (args.cmd) {
    case 'tobuy':
      replyText = await handleToBuy(args);
      break;
    default:
      replyText = await handleOther(args);
  }

  return {
    type: 'text',
    text: replyText,
  };
};

const handleToBuy = async (args: IToBuyArgs): Promise<string> => {
  const gid = await firebase.getGroupIdByUserId(args.lid);
  const categories = await firebase.getCustomCategories(gid);
  const buyCategories = categories.filter((cat) => cat.type === 'tobuy');

  switch (args.action) {
    case 'help':
      if (args.item === 'カテゴリ' || args.item === 'かてごり') {
        return '🐶ヘルプ(ToBuy > カテゴリ)🐶\n\n' +
               'カテゴリに指定できるのは、こちらです！\n' + 
               `${buyCategories.map((c) => `・${c.name} (${c.id})`).join('\n')}`;
      }
      return '🐶ヘルプ(ToBuy)🐶\n\n' +
             'こちらは機能の一覧です！\n\n' +
             '🗒 一覧 🗒\n' +
             'お買い物リストを表示します！\n' +
             'ex) 買い物 一覧 スーパー\n\n' +
             '🎁 追加 🎁  ※開発中🔧\n' +
             'お買い物リストに追加します！\n' +
             'ex) 買い物 追加 スーパー きのこ\n\n' +
             '🙅‍♂️ 削除 🙅‍♂️  ※開発中🔧\n' +
             'お買い物リストから削除します！\n' +
             'ex) 買い物 削除 きのこ\n\n' +
             '※[カテゴリ]に指定できるアイテムは"tobuy help カテゴリ"とチャットに入力ください🙇‍♂🐾';
    case 'list':
      const searchKey = !!args.buyCategory ? args.buyCategory : (args.item || '');
      const items = gid ? await firebase.getToBuyInputs(gid) : [];

      items.sort((a, b) => {
        const catA = buyCategories.find((cat) => cat.id === a.buyCategory);
        const catB = buyCategories.find((cat) => cat.id === b.buyCategory);
        return catA.setting.order - catB.setting.order;
      });

      let content = '🐶お買い物リスト🐶\n\n';
      if (!items.length) {
        return `${content}お買い物リストが登録されてないみたいです🐾\nTobuyから登録してね！`;
      }
      const searchedItems = items.filter((item) => {
        if (!searchKey) return true;
        return Object.keys(item).some((key) => {
          if (key === 'buyCategory') {
            const cat = buyCategories.find((c) => c.id === item[key]);
            return (Utils.hasString(cat.id, searchKey) || Utils.hasString(cat.name, searchKey));
          }
          return Utils.hasString(String(item[key]), searchKey);
        });
      });
      console.log('[INFO] Search key: ', searchKey, searchedItems.length);
      if (!searchedItems.length) {
        return `${content}検索結果がありませんでした。。🐾\n違う言葉か検索ワードなしで、また試してみてね！`;
      }
      searchedItems.forEach((item, i) => {
        if (i === 0 || items[i].buyCategory !== items[i - 1].buyCategory) {
          content += `🐾 ${CONST.getCategoryNameById(item.buyCategory)}\n`;
        }
        content += `  ・${item.item}\n`;
      });

      return content;
    default:
      return `${Chatbot.getActionName(args.action)}はまだお勉強中です。。。🐾`;
  }
};

const handleOther = async (args: IOtherArgs): Promise<string> => {
  const hellos = ['こんにちわ', 'おはよう', 'こんばんは', 'おやすみ', 'こんばんわ'];
  const words = args.words || [];
  const isHellos = words.some(word => Chatbot.isIncludesArr(word, hellos));
  if (isHellos) {
    return 'こんにちわん🐶\n今日も元気に頑張ってね！';
  }
  return 'まだ言葉を覚え中なので、上手くお返事ができないかもです。。🐶\n「お買い物」と言ってくれたら、買い物リストは表示できるよ🐾';
};
