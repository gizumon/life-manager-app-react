// You can include shared interfaces/types in a separate file
// and then use them in any component by importing them. For
// example, to import the interface below do:
//
// import { User } from 'path/to/interfaces';

export interface IValidate {
    type: string;
    args?: any[];
}
  
export interface IModel {
    id?: string;
    name: string;
    picture?: string;
    isSelected?: boolean;
}

export interface IInput {
    id: string;
    name: string;
    type: string;
    placeholder: string;
    icon: string;
    model: IModel | any;
    validates: IValidate[];
    args?: [];
    dataList?: IModel[];
}

export interface IConfig {
    type: string;
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