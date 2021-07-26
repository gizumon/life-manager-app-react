import { createContext, FC, useContext, useEffect, useState } from "react"
// import CONST from '../services/constService';
import firebase from 'firebase/app';
import 'firebase/database';
import { IConfig, ICategory, IMember, IGroup, IInputData, IConfigType } from '../interfaces/index';
import FirebaseFactory from '../test/factory/firebaseFactory';
import Utils from '../services/utilsService';

export const refsMap = {
    isUseFactory: 'triggers/isUseFactory',
    configs: 'masterdata/configs',
    categories: 'masterdata/categories',
    members: 'data/members',
    groups: 'data/groups',
    inputs: 'data/inputs'
};

let DB: firebase.database.Database | undefined;

const FirebaseContext = createContext<typeof firebase | undefined>(undefined);
export const FirebaseProvider: FC = ({ children }) => {
  const [app, setApp] = useState<typeof firebase>();

  useEffect(() => {
    let unmounted = false;
    const func = async () => {
      const firebaseApp = (await import('firebase/app')).default;
      if (firebase.apps.length < 1) {
        await firebaseApp.initializeApp(process.env.FIREBASE as Object);
      } else {
        firebase.app();
      }
      if (!unmounted) {
        setApp(firebaseApp);
      }
    }
    func();
    const cleanup = () => {
      unmounted = true;
    }
    return cleanup;
  }, []);

  return (
    <FirebaseContext.Provider
      value={app}
    >
      {children}
    </FirebaseContext.Provider>
  );
}

type IFirebaseData = {
  configs: IConfig[];
  categories: ICategory[];
  members: {[key: string]: IMember};
  groups: {[key: string]: IGroup};
  inputs: {[key: string]: {[key in IConfigType]: {[key in string]: IInputData}}};
}

type IDataStates = {
  configs: IConfig[];
  categories: ICategory[];
  members: IMember[];
  groups: IGroup[];
  inputs: {[key in string]: {[key in IConfigType]: IInputData[]}};
}

type IDataAndFlagStates = IDataStates & {
  isRunInitialized: boolean;
  isInitialized: boolean;
}

type IUseFirebaseReturn = IDataAndFlagStates & {
  firebase?: typeof firebase;
  db?: firebase.database.Database;
  getData?: (refPath: string) => Promise<any[]>;
  setData?: (refPath: string, data: any) => Promise<void>;
  pushData?: (refPath: string, data: any) => Promise<void>;
  pushInput?: (id: string, type: string, data: any) => Promise<firebase.database.Reference>;
  pushMember?: (data: IMember) => Promise<firebase.database.Reference>;
  pushGroup?: (data?: IGroup) => Promise<firebase.database.Reference>;
  pushGroupMember?: (groupId: string, data: IMember) => Promise<firebase.database.Reference>;
  isExistGroup?: (groupId?: string) => Promise<boolean>;
}

export const useFirebase = (): IUseFirebaseReturn => {
  const firebaseApp = useContext(FirebaseContext);
  const [states, setStates] = useState<IDataAndFlagStates>({isRunInitialized: false, isInitialized: false, configs: [], categories: [], members: [], groups: [], inputs: {}});
  DB = firebaseApp?.database();

  if (firebaseApp && DB && !states.isRunInitialized) {
    dataFactory();
    setStates((data) => { return { ...data, isRunInitialized: true } });
    asyncSetProperties().then((items: IFirebaseData) => {
      const members = convertObjectToArray(items.members) as IMember[];
      const groups = convertObjectToArray(items.groups) as IGroup[];
      const inputs = convertInputsToArray(items.inputs) as {[key in string]: {[key in IConfigType]: IInputData[]}};
      const processedConfigs = makePageConfigs(items.configs, items.categories, members);
      setStates((data) => {
        return {
          ...data,
          isInitialized: true,
          ...items,
          configs: processedConfigs,
          categories: items.categories,
          members: members,
          groups: groups,
          inputs: inputs,
        }
      });
    });
  }

  return {
    firebase: firebaseApp,
    db: DB,
    ...states,
    getData: getData,
    setData: setData,
    pushData: pushData,
    pushInput: pushInput,
    pushMember: pushMember,
    pushGroup: pushGroup,
    pushGroupMember: pushGroupMember,
    isExistGroup: isExistGroup,
  };
}

const asyncSetProperties = (): Promise<IFirebaseData> => {
  return new Promise(async (resolve, reject) => {
    const states: {[key in string]: any} = {};
    for (let key of ['configs', 'categories', 'members', 'groups', 'inputs']) {
      const items = await getData(refsMap[key as (keyof typeof refsMap)]).catch((err) => { reject(err); });
      states[key] = items;
    }
    resolve(states as IFirebaseData);
  });
}

const getData = async (refPath: string): Promise<any[]> => {
  return await DB?.ref(refPath).once('value').then((snapshot) => snapshot.val());
}

const setData = async (refPath: string, data: any): Promise<void> => {
  return await DB?.ref(refPath).push(data).then((value) => value).catch(err => { console.warn(err); return err; });
}

const pushData = async (refPath: string, data: any): Promise<void> => {
  return await DB?.ref(refPath).push(data).then((value) => value).catch(err => { console.warn(err); return err; });
}

const pushInput = (id: string, type: string, data: any): Promise<firebase.database.Reference> => {
  return new Promise<firebase.database.Reference>((resolve, reject) => {
    if (!DB) {
      return reject('DB has not defined...')
    }
    if (!id || !type) {
      return reject(`id or type is missing. id: ${id}: type: ${type}`);
    }
    const refName = `${refsMap.inputs}/${id}/${type}`;
    data['timestamp'] = firebase.database.ServerValue.TIMESTAMP;
    
    DB.ref(refName).push(data).then(val => {
      return resolve(val);
    }).catch(err => {
      console.warn(err);
      return reject(err);
    });
  });
}

const pushMember = (data: IMember): Promise<firebase.database.Reference> => {
  return new Promise<firebase.database.Reference>((resolve, reject) => {
    if (!DB) {
      return reject('DB has not defined...')
    }
    const refName = refsMap.members;
    data['timestamp'] = firebase.database.ServerValue.TIMESTAMP;

    DB.ref(refName).push(data).then(val => {
      return resolve(val);
    }).catch(err => {
      console.warn(err);
      return reject(err);
    });
  });
}

const pushGroup = (data: IGroup = {}): Promise<firebase.database.Reference> => {
  return new Promise<firebase.database.Reference>((resolve, reject) => {
    if (!DB) {
      return reject('DB has not defined...')
    }
    data['timestamp'] = firebase.database.ServerValue.TIMESTAMP;
    DB.ref(refsMap.groups).push(data).then(val => {
      return resolve(val);
    }).catch(err => {
      console.warn(err);
      return reject(err);
    });
  });
}

const pushGroupMember = (groupId: string, data: IMember) => {
  return new Promise<firebase.database.Reference>((resolve, reject) => {
    if (!DB) {
      return reject('DB has not defined...')
    }
    data['timestamp'] = firebase.database.ServerValue.TIMESTAMP;
    DB.ref(refsMap.groups).child(`${groupId}/members`).push(data).then(val => {
      return resolve(val);
    }).catch(err => {
      console.warn(err);
      return reject(err);
    });
  });
}

const isExistGroup = (groupId: string = '') => {
  return new Promise<boolean>((resolve, reject) => {
    if (!DB) {
      return reject('DB has not defined...');
    }
    if (!groupId) {
      return resolve(false);
    }
    DB.ref(refsMap.groups).once('value').then(snapshot => {
      const isExist = snapshot.hasChild(groupId);
      return resolve(isExist);
    }).catch(err => {
      console.warn(err);
      return reject(err);
    });
  });
}

const makePageConfigs = (configs: IConfig[], categories: ICategory[] = [], members: IMember[] = []): IConfig[] =>  {
  configs.forEach((config) => {
    config.inputs.forEach((input) => {
      input.dataList = input.id === 'payedFor' ? members
                      : input.id === 'payedCategory' ? categories.filter((category) => category.type === 'pay')
                      : input.id === 'payedBy' ? members
                      : input.id === 'doBy' ? members.concat({id: 'ALL', name: '全員'})
                      : input.id === 'doCategory' ?  categories.filter((category) => category.type === 'todo')
                      : input.id === 'buyCategory' ?  categories.filter((category) => category.type === 'tobuy')
                      : input.id === 'buyBy' ? members.concat({id: 'ALL', name: '全員'})
                      : [];
      input.model    = input.id === 'payedFor' ? members.map((member) => member.id)
                      : input.type === 'date' ? Utils.formatDate(new Date())
                      : input.model;
      input.validates?.forEach((validate) => {
          validate.args = input.type === 'select' && validate.type === 'isInclude' ? input.dataList?.map(data => data.id)
                        : input.type === 'select-btns' && validate.type === 'isInclude' ? input.dataList?.map(data => data.id)
                        : input.type === 'multi-check' && validate.type === 'isIncludeAll' ? input.dataList?.map(data => data.id)
                        : validate.args;
      });
    })
  })
  return configs;
}

const convertObjectToArray = (obj: {[key: string]: IMember | IGroup}) => {
  return Object.keys(obj).map((key) => {
    obj[key].id = key;
    return obj[key];
  });
}

const convertInputsToArray = (obj: {[key: string]: {[key in IConfigType]: {[key: string]: IInputData}}}): {[key in string]: {[key in IConfigType]: IInputData[]}} => {
  const data: any = {};
  Object.keys(obj).forEach(id => {
    data[id] = data[id] || {};
    Object.keys(obj[id]).forEach(key => {
      if (obj && obj[id] && obj[id][key as IConfigType]) {
        data[id][key] = Object.keys(obj[id][key as IConfigType]).map((dataId) => {
          obj[id][key as IConfigType][dataId].id = dataId;
          return obj[id][key as IConfigType][dataId];
        });
      }
    });
  });
  return data;
}

const dataFactory = () => {
  DB?.ref(refsMap.isUseFactory).once('value').then((snapshot: firebase.database.DataSnapshot) => {
      const isUseFactory = snapshot.val();
      if (!isUseFactory) { return; }
      FirebaseFactory.prepareAll(DB as firebase.database.Database);
  });
}