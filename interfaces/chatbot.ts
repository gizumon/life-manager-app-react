import { IPay, IToBuy, IToDo, IMember } from './index';

export type ICmdKey = 'help' | 'pay' | 'todo' | 'tobuy' | 'other';
export type IActionKey = 'add' | 'list' | 'delete' | 'help' | '';

export interface IBaseArgs {
	cmd: ICmdKey;
	action: IActionKey;
  replyToken: string;
  user?: IMember;
  words?: string[];
}

export interface IPayArgs extends Partial<IPay>, IBaseArgs { }
export interface IToBuyArgs extends Partial<IToBuy>, IBaseArgs { }
export interface IToDoArgs extends Partial<IToDo>, IBaseArgs { }
export interface IOtherArgs extends IBaseArgs { words?: string[]; }
export type IArgs = IPayArgs & IToBuyArgs & IToDoArgs & IOtherArgs;