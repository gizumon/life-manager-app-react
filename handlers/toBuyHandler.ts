import { NextApiResponse } from 'next';
import { NextPostApiRequest } from '../interfaces/api';
import { FirebaseService } from '../services/firebase';
import { IToBuy } from '../interfaces/index';
import errors, { IErrorResponse } from '../models/errorResponse';
import { defaultToBuy } from '../models/tobuy';

// id, groupId is required.
export interface IPostToBuyRequest {
  gid: string; // to register
  item: IToBuy['item'];
  buyCategory?: IToBuy['buyCategory'];
  buyBy?: IToBuy['buyBy'];
};
export type IPostToBuyResponse = Omit<IPostToBuyRequest, 'gid'>;

export const postToBuyHandler = (req: NextPostApiRequest<IPostToBuyRequest>, res: NextApiResponse<IPostToBuyResponse | IErrorResponse>) => {
  const apiName = 'postToBuy'
  const data = req.body;
  if (!data.gid) {
    return res.status(400).json(errors.VALIDATION_ERROR(apiName, 'gid is missing in request parameters.'));
  }
  if (!data.item) {
    return res.status(400).json(errors.VALIDATION_ERROR(apiName, 'item name is missing in request parameters.'));
  }
  const firebase = new FirebaseService();
  return firebase.isExistGroup(data.gid).then((isExist) => {
    if (!isExist) {
      console.log(`[INFO] Not found group: ${data.gid}`);
      return res.status(400).json(errors.VALIDATION_ERROR(apiName, `Not found group: ${data.gid}`));
    }

    const postData = {
      item: data.item,
      buyCategory: data.buyCategory || defaultToBuy.buyCategory,
      buyBy: data.buyBy || defaultToBuy.buyBy,
    };

    return firebase.pushToBuyInput(data.gid, postData).then((_) => {
      return res.json(postData);
    }).catch((e) => {
      console.log('[ERROR] Failed to access firebase via pushToBuyInput', e);
      return res.status(500).json(errors.DB_ERROR(apiName, 'Failed to access firebase in post tobuy handler'));
    });
  }).catch((e) => {
    console.log('[ERROR] Failed to access firebase via pushToBuyInput', e);
    return res.status(500).json(errors.DB_ERROR(apiName, 'Failed to access firebase in post tobuy handler'));
  })
};
