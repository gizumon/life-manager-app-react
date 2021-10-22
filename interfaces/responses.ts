/**
 * Response interfaces
 */
export type IResponseData = IChatbotResponse;
export interface IResponseBase {
  status: string;
  data?: IResponseBase;
}


export interface IChatbotResponse {}
