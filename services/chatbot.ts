import { IPay, IToDo, IToBuy } from '../interfaces/index';
import CONST from './constants';

export interface IBaseArgs {
  lid?: string;
	cmd: string;
	action: string;
}

export interface IPayArgs extends Partial<IPay>, IBaseArgs { }
export interface IToBuyArgs extends Partial<IToBuy>, IBaseArgs { }
export interface IToDoArgs extends Partial<IToDo>, IBaseArgs { }
export type IArgs = IPayArgs & IToBuyArgs & IToDoArgs;

type ICmdKey = 'help' | 'pay' | 'todo' | 'tobuy' | 'other';
type IActionKey = 'add' | 'list' | 'delete';

// cmd keys
const cmdHelpKeys = ['❓', 'help', 'Help', 'Help', 'へるぷ', 'ヘルプ', '使い方'];
const cmdPayKeys = ['💸', 'pay', 'PAY', 'Pay', '支払', '払った', '¥'];
const cmdTodoKeys = ['✅', 'do', 'todo', 'TODO', 'ToDo', 'やる事', 'タスク', '✓'];
const cmdTobuyKeys = ['🛒', 'buy', 'tobuy', 'TOBUY', 'ToBuy', 'Tobuy', '買い物', 'かいもの'];

const cmdKeys: {[key in ICmdKey]: string[]} = {
  help: cmdHelpKeys,
  pay: cmdPayKeys,
  todo: cmdTodoKeys,
  tobuy: cmdTobuyKeys,
  other: [], // chatbot
};

// action keys
const actionAddKeys = ['add', 'ADD', '追加', '+'];
const actionListKeys = ['list', 'LIST', 'show', 'SHOW', '一覧', 'ls'];
const actionDeleteKeys = ['delete', 'DELETE', 'del', 'DEL', '削除', '-'];

const actionKeys: {[key in IActionKey]: string[]} = {
  // help: cmdTobuyKeys,
  add: actionAddKeys,
  list: actionListKeys,
  delete: actionDeleteKeys,
};

// Separater
const argSeparator = /[¥s]+/;

namespace Chatbot {
  export const parseText = (text: string): IArgs => {
    const words = text.split(argSeparator);
    switch (true) {
      case isPayCmd(text):
        return separateTobuyArgs(words);
      case isToBuyCmd(text):
        return separateTobuyArgs(words);
      case isToDoCmd(text):
        return separateTobuyArgs(words);
      default:
        return separateTobuyArgs(words);
    }
  };
  
  const separateTobuyArgs = (words: string[]): IToBuyArgs => {
    const cmd = 'tobuy';
    const args: IToBuyArgs = {
      cmd: cmd,
      action: 'list',
      buyCategory: 'none',
      item: '',
    };
    words.forEach(word => {
      switch (true) {
        case hasCmdKey(word):
          return args.cmd = cmd;
        case hasActionKey(word):
          return args.action = getActionKey(word);
        case hasBuyCategory(word):
          return args.buyCategory = getBuyCategoryId(word);
        default:
          return args.item = `${args.item} ${word}`.trim();
      }
    });
    return args;
  };

  const isPayCmd = (text: string): boolean => {
    return getCmdKey(text) === 'pay';
  };
  
  const isToBuyCmd = (text: string): boolean => {
    return getCmdKey(text) === 'tobuy';
  };
  
  const isToDoCmd = (text: string): boolean => {
    return getCmdKey(text) === 'todo';
  };
  
  export const hasBuyCategory = (text: string): boolean => {
    return isIncludesArr(
      text,
      [].concat(
        CONST.buyCategories.map((cat) => cat.id),
        CONST.buyCategories.map((cat) => cat.name)
      )
    );
  };
  
  export const getBuyCategoryId = (text: string): string => {
    const categoryKeys = {};
    CONST.buyCategories.forEach((cat) => categoryKeys[cat.id] = [cat.id, cat.name]);
    return searchKeyFromWordList(text, categoryKeys);
  };
  
  export const hasCmdKey = (text: string): boolean => {
    return !!getCmdKey(text);
  };
  
  export const getCmdKey = (text: string): ICmdKey => {
    return searchKeyFromWordList(text, cmdKeys) as ICmdKey;
  };
  
  export const hasActionKey = (text: string): boolean => {
    return !!getActionKey(text);
  };
  
  export const getActionKey = (text: string): IActionKey => {
    return searchKeyFromWordList(text, actionKeys) as IActionKey;
  };
  
  const searchKeyFromWordList = (text: string, arr: {[key in string]: string[]}) => {
    let result = '';
    Object.keys(arr).some((key: string) => {
      const hasKey = arr[key as string].some((word) => text.indexOf(word) > -1);
      if (hasKey) {
        result = key;
        return true;
      }
    });
    return result;
  };
  
  const isIncludesArr = (text: string, arr: string[]): boolean => {
    return arr.some((word) => text.indexOf(word) > -1);
  };  
}

export default Chatbot;