import { IConfig, IValidatorType } from "../interfaces"
import { IFormData } from '../interfaces/index';

const regexpDateString = /^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])$/

type IErrorType = IValidatorType | 'hasDefinedKey';
type IValidateFn = (...arg: any) => boolean;
export class ValidationService {
    private config: IConfig;
    private validatorMap: {[key in IValidatorType]:  IValidateFn} = {
        isNotNull: this.isNotNull.bind(this),
        isNumber: this.isNumber.bind(this),
        isString: this.isString.bind(this),
        isLT: this.isLT.bind(this),
        isLE: this.isLE.bind(this),
        isGT: this.isGT.bind(this),
        isGE: this.isGE.bind(this),
        isBTW: this.isBTW.bind(this),
        isEqual: this.isEqual.bind(this),
        isDate: this.isDateString.bind(this),
        isInclude: this.isInclude.bind(this),
        isIncludeAll: this.isIncludeAll.bind(this),
    };

    constructor(config: IConfig) {
        this.config = config;
    }

    /**
     * validate
     * @param data validation target data
     * @returns [isValid, errorMessage]
     */
    public validate(data: IFormData = {}): [boolean, string] {
        let message = '';
        console.log('validate:', this.config, data);
        const isValidAll = Object.keys(data).every((key) => {
            const input = this.config.inputs.find((input) => input.id === key);
            console.log(`${key} config set: `, input, this.config.inputs);
            const validates = input?.validates;

            if (!input) {
                message = this.getErrorMessage('hasDefinedKey', key);
                return false;
            }
            if (!validates || validates.length < 1) {
                console.log(`${key} has no validation`);
                return true;
            }
            return validates?.every((valid) => {
                const args = valid.args || [];
                console.log('do validate: ', key, valid.type, data[key], args);
                const isValid = this.validatorMap[valid.type](data[key], args);
                if (!isValid) {
                    message = this.getErrorMessage(valid.type, input?.name, ...args as any[])
                }
                return isValid;
            });
        });
        return [isValidAll, message]
    }

    /**
     * get Error Message
     * @param errorType 
     * @param param1 
     * @returns 
     */
    private getErrorMessage(errorType: IErrorType, ...args: any) {
        console.log('show error: ', errorType, args);
        const errMsgTemplate = {
            hasDefinedKey: `「${args[0]}」は未定義のIDです`,
            isString: `「${args[0]}」は文字で入力してね`,
            isNumber: `「${args[0]}」は数値で入力してね`,
            isDate: `「${args[0]}」は日付で入力してね`,
            isNotNull: `「${args[0]}」は入力必須だよ`,
            isEqual: `「${args[0]}」は ${args[1]} のはずだよ`,
            isGT: `「${args[0]}」は ${args[1]} よりも大きい値で入力してね`,
            isGE: `「${args[0]}」は ${args[1]} 以上の値で入力してね`,
            isLT: `「${args[0]}」は ${args[1]} よりも小さい値で入力してね`,
            isLE: `「${args[0]}」は ${args[1]} 以下の値で入力してね`,
            isBTW: `「${args[0]}」は ${args[1]} 〜 ${args[2]} の値で入力してね`,
            isInclude: `「${args[0]}」は選択肢のどれかで入れてね`,
            isIncludeAll: `「${args[0]}」は全ての選択肢のどれかで入れてね`
        }
        return errMsgTemplate[errorType];
    }

    /**
     * is Equal
     * @param arg 
     * @param target 
     * @returns 
     */
    private isEqual(val: any, args: [number | string]): boolean {
        return val === args[0];
    }

    /**
     * is Number
     * @param arg validation value
     * @returns 
     */
    private isNumber(val: any): boolean {
        return typeof val === 'number';
    }

    /**
     * is String
     * @param val validation value
     * @returns 
     */
     private isString(val: any): boolean {
        return typeof val === 'string';
    }

    /**
     * is Date
     * @param val validation value
     * @returns 
     */
    private isDateString(val: any): boolean {
        return regexpDateString.test(val);
    }

    /**
     * is Not null
     * @param val validation value
     * @returns 
     */
    private isNotNull(val: any): boolean {
        return val !== undefined && val !== null;
    }

    /**
     * is Littler than
     * @param val [validation value, threshold]
     * @returns 
     */
    private isLT(val: any, args: [number]): boolean {
        return this.isNumber(val) && val < args[0];
    }

    /**
     * is Littler than or Equals to
     * @param val 
     * @param args [threshold] 
     * @returns 
     */
    private isLE(val: any, args: [number]): boolean {
        return this.isNumber(val) && val <= args[0];
    }

    /**
     * is Greater than
     * @param val 
     * @param args [threshold] 
     * @returns 
     */
    private isGT(val: any, args: [number]): boolean {
        return this.isNumber(val) && val > args[0];
    }

    /**
     * is Greater than or Equals to
     * @param val 
     * @param args [threshold] 
     * @returns 
     */
    private isGE(val: any, args: [number]): boolean {
        return this.isNumber(val) && val > args[0];
    }

    /**
     * is Between
     * @param val 
     * @param args [min, max]
     * @returns 
     */
    private isBTW(val: any, args: [number, number]) {
        return this.isNumber(val) && val > args[0] && val < args[1];
    }

    /**
     * is Include
     * @param val 
     * @param args [list] 
     * @returns 
     */
    private isInclude(val: any, args: any[] = []) {
        console.log('is include', 'val:', val, 'args :', args);
        return args && args.length > 0 && args.includes(val);
    }

    /**
     * is Include All
     * @param vals 
     * @param args 
     * @returns 
     */
    private isIncludeAll(vals: any[], args: any[] = []) {
        return vals.every((val) => this.isInclude(val, args));
    }
}