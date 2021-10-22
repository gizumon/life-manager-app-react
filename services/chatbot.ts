import { IPay, IToDo, IToBuy } from '../interfaces/index';
import CONST from './constants';

export interface IBaseArgs {
	cmd: string;
	action: string;
}

export interface IPayArgs extends IPay, IBaseArgs { }
export interface ITobuyArgs extends IToBuy, IBaseArgs { }
export interface ITodoArgs extends IToDo, IBaseArgs { }
export type IArgs = IPayArgs & ITobuyArgs & ITodoArgs;

type ICmdKey = 'help' | 'pay' | 'todo' | 'tobuy';
type IActionKey = 'add' | 'list' | 'delete';

// cmd keys
const cmdHelpKeys = ['❓', 'help', 'Help', 'Help', 'へるぷ', 'ヘルプ', '使い方'];
const cmdPayKeys = ['💸', 'pay', 'PAY', 'Pay', '支払', '払った', '¥'];
const cmdTodoKeys = ['✅', 'todo', 'TODO', 'ToDo', 'やる事', 'タスク', '✓'];
const cmdTobuyKeys = ['🛒', 'tobuy', 'TOBUY', 'ToBuy', 'Tobuy', '買い物', 'かいもの'];

const cmdKeys: {[key in ICmdKey]: string[]} = {
  help: cmdHelpKeys,
  pay: cmdPayKeys,
  todo: cmdTodoKeys,
  tobuy: cmdTobuyKeys,
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

// export const parseText = (text: string): IArgs => {
//   const words = text.split(argSeparator);
//   words.forEach(word => {
//     // switch (true) {
//     //   case hasCmdKey(word):
//     //   case hasActionKey(word):
//     //   case hasCategory():
//     // }
//   });
// }

// export const hasBuyCategory = (text: string): boolean => {
//   return isIncludesArr(text, [].concat(CONST.buyCategories.map((cat) => cat.id), CONST.buyCategories.map((cat) => cat.name)));
// }

export const hasCmdKey = (text: string): boolean => {
  return !!getCmdKey(text);
}

export const getCmdKey = (text: string): ICmdKey => {
  return searchKeyFromWordList(text, cmdKeys) as ICmdKey;
}

export const hasActionKey = (text: string): boolean => {
  return !!getActionKey(text);
}

export const getActionKey = (text: string): IActionKey => {
  return searchKeyFromWordList(text, actionKeys) as IActionKey;
}

const searchKeyFromWordList = (text: string, arr: {[key in string]: string[]}) => {
  let result = '';
  Object.keys(arr).some((key: string) => {
    const hasKey = arr[key as string].some((word) => word.indexOf(text) > -1);
    if (hasKey) {
      result = key;
      return true;
    }
  });
  return result;
}

const isIncludesArr = (text: string, arr: string[]): boolean => {
  return arr.some((word) => word.indexOf(text) > -1);
}
