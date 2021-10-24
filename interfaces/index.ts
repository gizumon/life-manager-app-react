// You can include shared interfaces/types in a separate file
// and then use them in any component by importing them. For
// example, to import the interface below do:
//
// import { User } from 'path/to/interfaces';
import { PaletteOptions } from '@material-ui/core/styles/createPalette';

/**
 * Category
 */
export type categoryType = 'pay' | 'tobuy'; 
export interface ICategory {
    id: string;
    name: string;
    type: string;
    isHide?: boolean;
    setting: ISetting;
};


export interface ISetting {
    order: number;
};

export interface IRatioSetting {
    memberId: String;
    ratio: Number;
};

export type IThemeType = 'default' | 'toy' | 'cool' | 'retro' | 'custom';
export type IThemeConfig = {
    id: IThemeType;
    label: string;
    palettesOptions: PaletteOptions;
};

export interface IThemeSetting {
    selectedTheme: IThemeType;
    custom?: PaletteOptions;
}

export interface IAccountSetting {
    lineId: string;
    name: string;
    // groupId: string;
}

/**
 * Config
 */
export type IConfigType = 'pay' | 'todo' | 'tobuy';
export type IInputType = 'number' | 'text' | 'date' | 'select' | 'multi-check' | 'select-btns';

export interface IMember {
    id?: string;
    lineId?: string;
    name: string;
    picture?: string;
    groupId?: string;
    timestamp?: any;
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
    args?: any[];
    dataList: (IMember | ICategory)[];
    order?: number;
    isHideList: boolean;
    isHideInput: boolean;
}

export interface IConfig {
    type: IConfigType;
    name: string;
    icon: string;
    description: string;
    inputs: IInput[];
    setting: {
        order: {
            id: string;
            type: 'asc' | 'desc' | 'custom';
        }[]
    };
}

export interface IPageConfig {
   valid: boolean;
   selectedId: string | undefined;
   selectedType: string | undefined;
   configs: IConfig[]; 
}

/**
 * Group
 */
 export interface IGroup {
    id?: string;
    categories?: ICategory[];
    members?: {[key: string]: IMember};
    themeSetting?: IThemeSetting;
    timestamp?: any;
}

/**
 * IFormData
 */
export interface IFormData {
    [key: string]: any;
}

/**
 * IInputDate
 */
export interface IPay {
    id: string;
    price: number;
    payedFor: string[];
    payedCategory: string;
    payedBy: string;
    memo: string;
    timestamp: number;
}

export interface IToBuy {
    id: string;
    item: string;
    buyCategory: string;
    buyBy: string;
    buyDueDate: string;
    timestamp: number;
}

export interface IToDo {
    id: string;
    task: string;
    doBy: string;
    doDueDate: string;
    timestamp: number;
}

export type IInputData = IPay & IToBuy & IToDo;


type ILineID = string;
type IGroupID = string;
type IIndex = number;
type IDataID = string;
export interface FirebaseData {
    data: {
        inputs: {
            [key in IGroupID]: {
                pay: {
                    [key in IDataID]: IPay;
                };
                tobuy: {
                    [key in IDataID]: IToBuy;
                };
                todo: {
                    [key in IDataID]: IToDo;
                };
            };
        };
    };
    groups: {
        [key in ILineID]: {
            categories: {
                [key in IIndex]: ICategory;
            };
            members: {
                [key in IIndex]: IMember;
            };
            themeSetting: {
                selectedTheme: IThemeType;
            };
        };
    };
    masterdata: {
        categories: {
            [key in IIndex]: ICategory;
        };
        configs: {
            [key in IIndex]: IConfig;
        };
    };
    triggers: {
        isUseFactory: boolean;
    };
    users: {
        [key in ILineID]: IMember;
    };
}