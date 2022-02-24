import { IActionKey, ICmdKey, IArgs } from '../interfaces/chatbot';
import { IToBuy, IMember, ICategory } from '../interfaces/index';
import Utils from '../services/utils';
import { FirebaseService } from '../services/firebase';
import * as line from '@line/bot-sdk';

export interface IModelProps {
  name: ICmdKey;
  lid: string;
  client: line.Client;
}

export default class BaseModel {
  public firebase: FirebaseService;

  public name: ICmdKey;
  public id: string;
  public lid: string;
  public client: line.Client;

  public user: IMember;
  public argSeparator = /\s/g;

  public cmdKeys = [];
  public cmdHelpKeys = ['❓', 'help', 'Help', 'Help', 'へるぷ', 'ヘルプ', '使い方'];
  public cmdPayKeys = ['💸', 'pay', 'PAY', 'Pay', '支払', '払った', '¥'];
  public cmdTodoKeys = ['✅', 'do', 'todo', 'TODO', 'ToDo', 'やる事', 'タスク', '✓'];
  public cmdTobuyKeys = ['🛒', 'buy', 'tobuy', 'TOBUY', 'ToBuy', 'Tobuy', '買い物', 'かいもの'];
  public cmdKeysMap: {[key in ICmdKey]: string[]} = {
    pay: this.cmdPayKeys,
    todo: this.cmdTodoKeys,
    tobuy: this.cmdTobuyKeys,
    help: this.cmdHelpKeys,
    other: [], // chatbot
  };

  public actionKeys = [];
  public actionAddKeys = ['+', 'add', 'ADD', '追加', 'ついか'];
  public actionListKeys = ['ls', 'list', 'LIST', 'show', 'SHOW', '一覧', 'いちらん', 'リスト', 'りすと'];
  public actionDeleteKeys = ['-', 'delete', 'DELETE', 'del', 'DEL', '削除', 'さくじょ'];
  public actionHelpKeys = ['?', 'help', 'Help', 'Help', 'へるぷ', 'ヘルプ', '使い方'];

  public actionKeysMap: Partial<{[key in IActionKey]: string[]}> = {
    // help: cmdTobuyKeys,
    add: this.actionAddKeys,
    list: this.actionListKeys,
    delete: this.actionDeleteKeys,
    help: this.actionHelpKeys,
  };
  public actionNameMap = {
    add: '追加',
    list: '一覧',
    delete: '削除',
    help: 'ヘルプ',
  };
  public categories: ICategory[];
  public categoriesMap: {[key in string]: string};

  constructor (props: IModelProps) {
    this.name = props.name;
    this.lid = props.lid;
    this.client = props.client;
    this.firebase = new FirebaseService();
    // this.initialize();
    return this;
  }

  public async initialize() {
    // should override here;
    this.id = await this.firebase.getUserIdByLid(this.lid); 
    this.user = await this.firebase.getUserById(this.id);
    this.categories = [].concat(
      await this.firebase.getCategories(),
      await this.firebase.getCustomCategories(this.user.groupId),
    ).filter((c) => c.type === this.name);
  }

  public parseText(text: string, event: line.WebhookEvent): IArgs {
    // should override here
    return {
      cmd: 'other',
      action: '',
      replyToken: '',
    };
  }

  public getAnyCmdKey(text: string): ICmdKey {
    return Utils.searchKeyFromWordList(text, this.cmdKeysMap) as ICmdKey;
  }

  public hasAnyCmdKey(text: string): boolean {
    return !!this.getAnyCmdKey(text);
  }

  public getActionKey(text: string): IActionKey {
    return Utils.searchKeyFromWordList(text, this.actionKeysMap) as IActionKey;    
  }

  public hasActionKey(text: string): boolean {
    return !!this.getActionKey(text);
  }

  public hasThisCmdKey(text: string): boolean {
    return this.getAnyCmdKey(text) === this.name;
  }

  public getActionName (key: string): string {
    return this.actionNameMap[key] || '';
  };

  public getCategoryId(text: string): string {
    let result;
    this.categories.some((cat) => {
      if (Utils.hasString(text, cat.id) || Utils.hasString(text, cat.name)) {
        result = cat.id;
        return true;
      }
    });
    return result;
  }

  public getCategoryNameFromId(id: string): string {
    const cat = this.categories.find((c) => c.id === id);
    return cat ? cat.name : '不明なカテゴリID';
  }

  public hasCategory(text: string): boolean {
    return !!this.getCategoryId(text);
  }

  // should override
  public async doAction(args: IArgs): Promise<boolean> {
    return false;
  }

  public async textReply(replyToken: string, text: string): Promise<boolean> {
    const message: line.TextMessage = {
      type: 'text',
      text: text,
    };

    return await this.client.replyMessage(replyToken, message).then((res) => {
      return true;
    }).catch((e) => {
      console.log('[ERROR] Failed to reply message', e);
      return false;
    });
  }

}