import { ICategory, IToBuy } from "../interfaces";
import { IArgs, IToBuyArgs } from '../interfaces/chatbot';
import BaseModel from "./baseModel";
import { IMember } from '../interfaces/index';
import Utils from "../services/utils";
import CONST from "../services/constants";
import { IModelProps } from './baseModel';
import * as line from '@line/bot-sdk';

interface IProps extends Partial<IModelProps> {}

export default class ToBuyModel extends BaseModel {
  constructor (props: IProps) {
    super({
      name: 'tobuy',
      lid: props.lid,
      client: props.client,
    });
    this.actionAddKeys.push('買う', '買わなきゃ', '買いたい');
    this.actionDeleteKeys.push('買った');
  }

  // override
  // public async initialize() {
  //   super();
  // }

  // override
  public parseText(text: string, event: line.MessageEvent): IToBuyArgs {
    const words = text.split(this.argSeparator);
    const args: IToBuyArgs = {
      cmd: this.name,
      action: '',
      replyToken: event.replyToken,
      words: words,
      user: this.user,
      item: '',
      // buyCategory: 'none',
    };
    words.forEach((word, i) => {
      const isFirst = i === 0;
      switch (true) {
        case isFirst && this.hasThisCmdKey(word):
          return args.cmd = this.name;
        case this.hasActionKey(word):
          return args.action = this.getActionKey(word);
        case this.hasCategory(word):
          return args.buyCategory = this.getCategoryId(word);
        default:
          return args.item = `${args.item} ${word}`.trim();
      }
    });
    // Support add patter for "お買い物 きのこ"
    if (args.action === 'list' && args.item) {
      args.action = 'add';
    }
    // Support none category pattern
    if (args.action === 'add' && !args.buyCategory) {
      args.buyCategory = 'none';
    }
    console.log('[INFO] Parse words to args', words, args);
    return args;
  }

  public async getReplyMessage(args: IArgs): Promise<string> {  
    switch (args.action) {
      case 'help':

      case '': // default
      case 'list': // default
        const searchKey = !!args.buyCategory ? args.buyCategory : (args.item || '');
        const items = await this.firebase.getToBuyInputs(this.user.groupId);
  
        items.sort((a, b) => {
          const catA = this.categories.find((cat) => cat.id === a.buyCategory);
          const catB = this.categories.find((cat) => cat.id === b.buyCategory);
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
              const cat = this.categories.find((c) => c.id === item[key]);
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
        const actionName = this.getActionName(args.action);
        return actionName ? `${actionName}はまだお勉強中です。。。🐾` : `すみません、別の言い方でお願いします。。。`;
    }
  }

  // override
  public async doAction(args: IToBuyArgs): Promise<boolean> {
    switch (args.action) {
      case '':
      case 'list':
        return await this.doListTextReply(args);
      case 'add': // Add item to db
        return await this.doAddTextReply(args);
      case 'delete':
      case 'help':
        return await this.doHelpTextReply(args);
      default:
        return await this.doDefaultTextReply(args);
    }
  }

  // const actionName = this.getActionName(args.action);
  // return actionName ? `${actionName}はまだお勉強中です。。。🐾` : `すみません、別の言い方でお願いします。。。`;
  public async doDefaultTextReply(args: IToBuyArgs): Promise<boolean> {
    const actionName = this.getActionName(args.action);
    const content = actionName ? `${actionName}はまだお勉強中です。。。🐾`
                               : `お買い物リストで何かしたいですか、、？？\n` +
                                 `すみませんが別の言い方でお願いします。。\n\n` +
                                 `「お買い物 ヘルプ」と言ってくれればできることをご紹介します🐶`;
    return this.textReply(args.replyToken, content);
  }

  public async doHelpTextReply(args: IToBuyArgs): Promise<boolean> {
    let content: string;
    if (args.item === 'カテゴリ' || args.item === 'かてごり') {
      // Category Help
      content = '🐶ヘルプ(ToBuy > カテゴリ)🐶\n\n' +
                'カテゴリに指定できるのは、こちらです！\n' + 
                `${this.categories.map((c) => `・${c.name} (${c.id})`).join('\n')}`;
    }
    // Tobuy Help
    content = '　　　 🐶ヘルプ(ToBuy)🐶　　\n\n' +
              '======【 How to use 】======\n\n' +
              '以下の様にチャットして下さい🕴\n\n' +
              '[①ｷｰ] [②ｱｸｼｮﾝ] [③ｶﾃｺﾞﾘ] [④ｱｲﾃﾑ]\n\n' +
              '①キー: *必須\n' +
              ' ・🛒, 買い物, buy, ToBuy\n' +
              '②アクション:\n' +
              ' ・一覧 : ls, list, 一覧 *デフォルト\n' +
              ' ・追加 : +, add, 追加, 買う\n' +
              ' ・削除 : -, del, 削除, 買った\n' +
              ' ・ヘルプ: ?, help, ヘルプ\n' +
              '③カテゴリ:\n' +
              ' ・その他, スーパー, 100均\n' +
              ' ⚠️"追加"の場合には、必須\n' +
              ' ⚠️"買い物 ヘルプ カテゴリ"で指定可能な一覧を表示\n' +
              '④アイテム:\n' +
              ' ・任意のアイテム\n' +
              ' ⚠️"追加"の場合には、必須\n\n' +
              '======【   機能一覧   】======\n\n' +
              'こちらは機能の一覧です！\n\n' +
              '🗒 一覧 🗒\n' +
              'お買い物リストを表示します！(3つ目に指定した項目でお買い物リストを検索)\n' +
              'ex) 買い物 一覧 スーパー\n\n' +
              '🎁 追加 🎁\n' +
              'お買い物リストに追加します！\n' +
              'ex) 買い物 追加 スーパー きのこ\n\n' +
              '🙅‍♂️ 削除 🙅‍♂️  ※開発中🔧\n' +
              'お買い物リストから削除します！\n' +
              'ex) 買い物 削除 きのこ\n';

    return this.textReply(args.replyToken, content);
  }

  public async doAddTextReply(args: IToBuyArgs): Promise<boolean> {
    // validation
    const [errMsg, newArgs] = this.validate(args);
    if (!!errMsg) {
      return this.textReply(args.replyToken, errMsg);
    }
    await this.firebase.pushToBuyInput(this.user.groupId, this.makeData(newArgs)).catch((e) => {
      return this.textReply(args.replyToken, 'お買い物リストへの追加に失敗しました。。。😢\nしばらくしたらまたお試しください🙇‍♂️');
    });

    const message = args.item + '(' + this.getCategoryNameFromId(args.buyCategory) + ')' + 'を追加しました🐶';
    return this.textReply(args.replyToken, message);
  }

  public async doListTextReply(args: IToBuyArgs): Promise<boolean> {
    const searchKey = !!args.buyCategory ? args.buyCategory : (args.item || '');
    
    const items = await this.firebase.getToBuyInputs(this.user.groupId);
    items.sort((a, b) => {
      const catA = this.categories.find((cat) => cat.id === a.buyCategory);
      const catB = this.categories.find((cat) => cat.id === b.buyCategory);
      return catA.setting.order - catB.setting.order;
    });

    let content = '🐶お買い物リスト🐶\n\n';
    if (!items.length) {
      content += `お買い物リストが登録されてないみたいです🐾\nTobuyから登録してね！`;
      return this.textReply(args.replyToken, content);
    }

    const searchedItems = items.filter((item) => {
      if (!searchKey) return true;
      return Object.keys(item).some((key) => {
        if (key === 'buyCategory') {
          const cat = this.categories.find((c) => c.id === item[key]);
          return (Utils.hasString(cat.id, searchKey) || Utils.hasString(cat.name, searchKey));
        }
        return Utils.hasString(String(item[key]), searchKey);
      });
    });

    if (!searchedItems.length) {
      content += `検索結果がありませんでした。。🐾\n違う言葉か検索ワードなしで、また試してみてね！`;
      return this.textReply(args.replyToken, content);
    }

    
    searchedItems.forEach((item, i) => {
      console.log('item (cur, pre)', searchedItems[i - 1], searchedItems[i]);
      if (i === 0 || (searchedItems[i].buyCategory !== searchedItems[i - 1].buyCategory)) {
        content += `🐾 ${CONST.getCategoryNameById(item.buyCategory)}\n`;
      }
      content += `  ・${item.item}\n`;
    });

    return this.textReply(args.replyToken, content);
  }

  public validate(args: IToBuyArgs): [string, IToBuyArgs] {
    switch (args.action) {
      case 'add':
        if (!args.item) {
          // validation failed
          return [
            '追加したいアイテムが分かりませんでした。。😢\n' +
            '下記みたいな感じでもう一回送ってください🐶\n\n' +
            '買い物 追加 スーパー きのこ\n\n' +
            'ちなみに、"スーパー"のところは、\n' +
            '"買い物 ヘルプ カテゴリ"と入力してくれれば、何のカテゴリが使用できるか教えます！\n' +
            '指定しない場合には"その他"で登録します🐶',
            args
          ];
        }
        if (!args.buyCategory) {
          return [
            '追加したいカテゴリが分かりませんでした。。😢\n' +
            '下記みたいな感じでもう一回送ってください🐶\n\n' +
            '買い物 追加 スーパー きのこ\n\n' +
            'ちなみに、"スーバー"のところは、"買い物 ヘルプ カテゴリ"と入力してくれれば、何のカテゴリが使用できるか教えます！\n' +
            '指定しない場合には"その他"で登録します🐶',
            args
          ];
        }
        return ['', args];
      default:
        return ['', args];
    }
  }

  public makeData(args: IToBuyArgs): Partial<IToBuy> {
    return {
      item: args.item,
      buyCategory: args.buyCategory,
    };
  }
}