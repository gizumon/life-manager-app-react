// You can include shared interfaces/types in a separate file
// and then use them in any component by importing them. For
// example, to import the interface below do:
//
// import { User } from 'path/to/interfaces';

/**
 * Category
 */
export type categoryType = 'pay' | 'tobuy'; 
export interface ICategory {
    id: string;
    name: string;
    type: string;
    setting?: IRatioSetting[];
};

export interface IRatioSetting {
    memberId: String;
    ratio: Number;
};

/**
 * Config
 */
export type IConfigType = 'pay' | 'todo' | 'tobuy';
export type IInputType = 'number' | 'text' | 'date' | 'select' | 'multi-check' | 'select-btns';

export interface IMember {
    id: string;
    lineId?: string;
    name: string;
    picture?: string;
    groupId?: string; 
}

export type IValidatorType = 'isNotNull' | 'isEqual' | 'isLT' | 'isLE' | 'isGT' | 'isGE' | 'isBTW'
                           | 'isNumber' | 'isString' | 'isDate' | 'isInclude' | 'isIncludeAll';

export interface IValidate {
    type: IValidatorType;
    args?: any[];
}

export interface IModel {
    id?: string;
    line_id?: string;
    name: string;
    picture?: string;
    isSelected?: boolean;
}

export interface IInput {
    id: string;
    name: string;
    type: IInputType;
    placeholder: string;
    icon: string;
    model: any;
    // model: IModel | IModel[] | any;
    validates: IValidate[];
    args?: [];
    dataList?: IModel[];
}

export interface IConfig {
    type: IConfigType;
    name: string;
    icon: string;
    description: string;
    inputs: IInput[];
}

export interface IPageConfig {
   valid: boolean;
   selectedId: string | undefined;
   selectedType: string | undefined;
   configs: IConfig[]; 
}

/**
 * IFormData
 */
export interface IFormData {
    [key: string]: any;
}
