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
            hasDefinedKey: `???${args[0]}??????????????????ID??????`,
            isString: `???${args[0]}??????????????????????????????`,
            isNumber: `???${args[0]}??????????????????????????????`,
            isDate: `???${args[0]}??????????????????????????????`,
            isNotNull: `???${args[0]}????????????????????????`,
            isEqual: `???${args[0]}?????? ${args[1]} ???????????????`,
            isGT: `???${args[0]}?????? ${args[1]} ???????????????????????????????????????`,
            isGE: `???${args[0]}?????? ${args[1]} ??????????????????????????????`,
            isLT: `???${args[0]}?????? ${args[1]} ???????????????????????????????????????`,
            isLE: `???${args[0]}?????? ${args[1]} ??????????????????????????????`,
            isBTW: `???${args[0]}?????? ${args[1]} ??? ${args[2]} ????????????????????????`,
            isInclude: `???${args[0]}??????????????????????????????????????????`,
            isIncludeAll: `???${args[0]}???????????????????????????????????????????????????`
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
        return this.isEmpty(val) || val === args[0];
    }

    /**
     * is Number
     * @param arg validation value
     * @returns 
     */
    private isNumber(val: any): boolean {
        return this.isEmpty(val) || typeof val === 'number';
    }

    /**
     * is String
     * @param val validation value
     * @returns 
     */
     private isString(val: any): boolean {
        return this.isEmpty(val) || typeof val === 'string';
    }

    /**
     * is Date
     * @param val validation value
     * @returns 
     */
    private isDateString(val: any): boolean {
        return this.isEmpty(val) || regexpDateString.test(val);
    }

    /**
     * is Not null
     * @param val validation value
     * @returns 
     */
    private isNotNull(val: any): boolean {
        return !this.isEmpty(val);
    }

    /**
     * is Littler than
     * @param val [validation value, threshold]
     * @returns 
     */
    private isLT(val: any, args: [number]): boolean {
        return this.isEmpty(val) || (this.isNumber(val) && val < args[0]);
    }

    /**
     * is Littler than or Equals to
     * @param val 
     * @param args [threshold] 
     * @returns 
     */
    private isLE(val: any, args: [number]): boolean {
        return this.isEmpty(val) || (this.isNumber(val) && val <= args[0]);
    }

    /**
     * is Greater than
     * @param val 
     * @param args [threshold] 
     * @returns 
     */
    private isGT(val: any, args: [number]): boolean {
        return this.isEmpty(val) || (this.isNumber(val) && val > args[0]);
    }

    /**
     * is Greater than or Equals to
     * @param val 
     * @param args [threshold] 
     * @returns 
     */
    private isGE(val: any, args: [number]): boolean {
        return this.isEmpty(val) || (this.isNumber(val) && val > args[0]);
    }

    /**
     * is Between
     * @param val 
     * @param args [min, max]
     * @returns 
     */
    private isBTW(val: any, args: [number, number]) {
        return this.isEmpty(val) || (this.isNumber(val) && val > args[0] && val < args[1]);
    }

    /**
     * is Include
     * @param val 
     * @param args [list] 
     * @returns 
     */
    private isInclude(val: any, args: any[] = []) {
        console.log('is include', 'val:', val, 'args :', args);
        return this.isEmpty(val) || (args && args.length > 0 && args.includes(val));
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

    /**
     * is Empty
     * @param val 
     * @returns 
     */
    private isEmpty(val: any) {
        return val === undefined || val === null || val === '';
    }
}