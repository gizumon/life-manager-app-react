import { IPay, IToDo, IToBuy } from '../interfaces/index';
import CONST from './constants';
import Utils from './utils';

export interface IBaseArgs {
  lid?: string;
	cmd: ICmdKey;
	action: IActionKey;
}

export interface IPayArgs extends Partial<IPay>, IBaseArgs { }
export interface IToBuyArgs extends Partial<IToBuy>, IBaseArgs { }
export interface IToDoArgs extends Partial<IToDo>, IBaseArgs { }
export interface IOtherArgs extends IBaseArgs {
  words?: string[];
}
export type IArgs = IPayArgs & IToBuyArgs & IToDoArgs & IOtherArgs;


type ICmdKey = 'help' | 'pay' | 'todo' | 'tobuy' | 'other';
type IActionKey = 'add' | 'list' | 'delete' | 'help' | '';

const actionNameMap = {
  add: '追加',
  list: '一覧',
  delete: '削除',
  help: 'ヘルプ',
};

// cmd keys
const cmdHelpKeys = ['❓', 'help', 'Help', 'Help', 'へるぷ', 'ヘルプ', '使い方'];
const cmdPayKeys = ['💸', 'pay', 'PAY', 'Pay', '支払', '払った', '¥'];
const cmdTodoKeys = ['✅', 'do', 'todo', 'TODO', 'ToDo', 'やる事', 'タスク', '✓'];
const cmdTobuyKeys = ['🛒', 'buy', 'tobuy', 'TOBUY', 'ToBuy', 'Tobuy', '買い物', 'かいもの'];

const cmdKeys: {[key in ICmdKey]: string[]} = {
  pay: cmdPayKeys,
  todo: cmdTodoKeys,
  tobuy: cmdTobuyKeys,
  help: cmdHelpKeys,
  other: [], // chatbot
};

// action keys
const actionAddKeys = ['+', 'add', 'ADD', '追加'];
const actionListKeys = ['ls', 'list', 'LIST', 'show', 'SHOW', '一覧'];
const actionDeleteKeys = ['-', 'delete', 'DELETE', 'del', 'DEL', '削除'];

const actionKeys: Partial<{[key in IActionKey]: string[]}> = {
  // help: cmdTobuyKeys,
  add: actionAddKeys,
  list: actionListKeys,
  delete: actionDeleteKeys,
  help: cmdHelpKeys,
};

// Separater
const argSeparator = /\s/g;

namespace Chatbot {
  export const parseText = (text: string): IArgs => {
    const words = text.split(argSeparator);
    console.log('[INFO]Parse text', isPayCmd(text), isToBuyCmd(text), isToDoCmd(text));
    switch (true) {
      case isPayCmd(text):
        console.log('[INFO] Is Pay cmd message', words);
        return separateTobuyArgs(words);
      case isToBuyCmd(text):
        console.log('[INFO] Is ToBuy cmd message', words);
        return separateTobuyArgs(words);
      case isToDoCmd(text):
        console.log('[INFO] Is ToDo cmd message', words);
        return separateTobuyArgs(words);
      default:
        console.log('[INFO] Is Others cmd message', words);
        return separateOtherArgs(words);
    }
  };

  const separateTobuyArgs = (words: string[]): IToBuyArgs => {
    const cmd = 'tobuy';
    const args: IToBuyArgs = {
      cmd: cmd,
      action: '',
    };
    words.forEach((word, i) => {
      const isFirst = i === 0;
      switch (true) {
        case isFirst && hasCmdKey(word):
          return args.cmd = cmd;
        case hasActionKey(word):
          return args.action = getActionKey(word);
        case hasBuyCategory(word):
          return args.buyCategory = getBuyCategoryId(word);
        default:
          return args.item = `${args.item} ${word}`.trim();
      }
    });
    console.log('[INFO] Parse words to args', words, args);
    return args;
  };

  const separateOtherArgs = (words: string[]): IOtherArgs => {
    const cmd = 'other';
    const args: IOtherArgs = {
      cmd: cmd,
      action: '',
      words,
    };
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

  // TODO: Use firebase data
  export const hasBuyCategory = (text: string): boolean => {
    return isIncludesArr(
      text,
      [].concat(
        CONST.buyCategories.map((cat) => cat.id),
        CONST.buyCategories.map((cat) => cat.name),
      ),
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
      const hasKey = arr[key as string].some((word) => Utils.hasString(text, word));
      if (hasKey) {
        result = key;
        return true;
      }
    });
    return result;
  };

  export const isIncludesArr = (text: string, arr: string[]): boolean => {
    return arr.some((word) => text.indexOf(word) > -1);
  };

  export const getActionName = (key: string): string => {
    return actionNameMap[key] || '';
  };
}

export default Chatbot;