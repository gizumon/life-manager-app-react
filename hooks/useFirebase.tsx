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
    members: 'users',
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
  // members: IMember[];
  // inputs: {[key in string]: {[key in IConfigType]: IInputData[]}};
}

type IActivateDataStates = {
  isGroupActivated: boolean;
  configs: IConfig[];
  groups: IGroup[];
  groupMembers: IMember[];
  inputs: {[key in IConfigType]: IInputData[]};
}

type IDataAndFlagStates = IDataStates & {
  isRunInitialized: boolean;
  isInitialized: boolean;
}

type IUseFirebaseReturn = IDataAndFlagStates & IActivateDataStates & {
  firebase?: typeof firebase;
  db?: firebase.database.Database;
  getData?: (refPath: string) => Promise<any[]>;
  setData?: (refPath: string, data: any) => Promise<void>;
  pushData?: (refPath: string, data: any) => Promise<void>;
  pushInput?: (id: string, type: string, data: any) => Promise<firebase.database.Reference>;
  // pushMember?: (data: IMember) => Promise<firebase.database.Reference>;
  getMember?: (lineId: string) => Promise<IMember>;
  updateMember?: (lineId: string, data: IMember) => Promise<firebase.database.Reference>;
  pushGroup?: (data?: IGroup) => Promise<firebase.database.Reference>;
  updateGroupMember?: (groupId: string, data: IMember) => Promise<firebase.database.Reference>;
  isExistGroup?: (groupId: string) => Promise<boolean>;
  isExistMember?: (lineId: string) => Promise<boolean>;
  activateGroup?: (groupId: string) => void;
  makePageConfigs?: (configs: IConfig[], categories: ICategory[], members: IMember[]) => IConfig[];
}

export const useFirebase = (): IUseFirebaseReturn => {
  const firebaseApp = useContext(FirebaseContext);
  const [states, setStates] = useState<IDataAndFlagStates>({isRunInitialized: false, isInitialized: false, configs: [], categories: []});
  const [activateState, setActivateState] = useState<IActivateDataStates>({isGroupActivated: false, groups: [], groupMembers: [], configs: [], inputs:  {pay: [], todo: [], tobuy:[]}});
  DB = firebaseApp?.database();

  const activateGroup = (groupId: string) => {
    if (!DB || !groupId || activateState.isGroupActivated || states.configs.length < 1) { return; }
    DB.ref(refsMap.groups).child(groupId).once('value').then((groupSnap) => {
      const group = groupSnap.val() as IGroup;
      if (!group || !group.members) { return; }
      const groupMembers = convertObjectToArray(group.members as {[key: string]: IMember}) as IMember[];
      console.log('activate group: ', group, groupMembers);
      
      DB?.ref(refsMap.inputs).child(groupId).once('value').then((inputSnap) => {
        const inputs = convertGroupInputsToArray(inputSnap.val() as {[key in IConfigType]: {[key: string]: IInputData}});
        setActivateState({
          isGroupActivated: true,
          configs: makePageConfigs(states.configs, states.categories, groupMembers),
          groups: [group],
          groupMembers: groupMembers,
          inputs: inputs || {pay: [], todo: [], tobuy:[]},
        });
      });
    });
  }

  if (firebaseApp && DB && !states.isRunInitialized) {
    console.log('isRunInitializedはfalseのはず', states);
    dataFactory();
    setStates((data) => {
      return { ...data, isRunInitialized: true }
    });
    asyncSetProperties().then((items: IFirebaseData) => {
      // const members = convertObjectToArray(items.members) as IMember[];
      // const groups = convertObjectToArray(items.groups) as IGroup[];
      // const inputs = convertInputsToArray(items.inputs) as {[key in string]: {[key in IConfigType]: IInputData[]}};
      setStates((data) => {
        console.log('こっちも走っちゃった。。。', items, data);
        return {
          ...data,
          isRunInitialized: true,
          isInitialized: true,
          configs: items.configs,
          categories: items.categories,
        }
      });
    });
  }

  return {
    firebase: firebaseApp,
    db: DB,
    ...states,
    ...activateState,
    // configs: activateState.configs.length > 0 ? activateState.configs : states.configs,
    getData: getData,
    setData: setData,
    pushData: pushData,
    pushInput: pushInput,
    // pushMember: pushMember,
    getMember: getMember,
    updateMember: updateMember,
    pushGroup: pushGroup,
    updateGroupMember: updateGroupMember,
    isExistGroup: isExistGroup,
    isExistMember: isExistMember,
    activateGroup: activateGroup,
    makePageConfigs: makePageConfigs,
  };
}

const asyncSetProperties = (): Promise<IFirebaseData> => {
  return new Promise(async (resolve, reject) => {
    const obj: {[key in string]: any} = {};
    for (let key of ['configs', 'categories',  'inputs']) {
      const items = await getData(refsMap[key as (keyof typeof refsMap)]).catch((err) => { reject(err); });
      obj[key] = items;
    }
    resolve(obj as IFirebaseData);
  });
}

const getData = async (refPath: string): Promise<any[]> => {
  return await DB?.ref(refPath).once('value').then((snapshot) => snapshot.val());
}

const setData = async (refPath: string, data: any): Promise<void> => {
  return await DB?.ref(refPath).set(data).then((value) => value).catch(err => { console.warn(err); return err; });
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

const getMember = (lineId: string): Promise<IMember> => {
  return new Promise<IMember>((resolve, reject) => {
    if (!DB) {
      return reject('DB has not defined...')
    }
    if(!lineId) {
      return reject(`id is missing.`);
    }
    DB?.ref(refsMap.members).child(lineId).once('value').then((snapshot) => {
      return resolve(snapshot.val());
    }).catch(e => {
      return reject(e);
    });
  });
}

const updateMember = (lineId: string, data: IMember): Promise<firebase.database.Reference> => {
  return new Promise<firebase.database.Reference>((resolve, reject) => {
    if (!DB || !lineId || !data) {
      return reject('DB has not defined...');
    }
    data['timestamp'] = firebase.database.ServerValue.TIMESTAMP;

    DB.ref(refsMap.members).child(lineId).update(data).then(val => {
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
      return reject('DB has not defined...');
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

const updateGroupMember = (groupId: string, data: IMember) => {
  return new Promise<firebase.database.Reference>((resolve, reject) => {
    if (!DB) {
      return reject('DB has not defined...');
    }
    if (!data.lineId) {
      return reject('lineId has not defined...');
    }
    data['timestamp'] = firebase.database.ServerValue.TIMESTAMP;
    DB.ref(refsMap.groups).child(`${groupId}/members`).child(data.lineId).update(data).then(val => {
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

const isExistMember = (lineId: string) => {
  return new Promise<boolean>((resolve, reject) => {
    if (!DB) {
      return reject('DB has not defined...');
    }
    if (!lineId) {
      return resolve(false);
    }
    DB.ref(refsMap.members).once('value').then(snapshot => {
      const isExist = snapshot.hasChild(lineId);
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
    });
  });
  return configs;
}

const convertObjectToArray = (obj: {[key: string]: IMember | IGroup}): (IMember | IGroup)[] => {
  if (!obj) return [];
  const data = Object.assign({}, obj);
  return Object.keys(data).map((key) => {
    data[key].id = key;
    return data[key];
  });
}

// const convertInputsToArray = (obj: {[key: string]: {[key in IConfigType]: {[key: string]: IInputData}}}): {[key in string]: {[key in IConfigType]: IInputData[]}} => {
//   if (!obj) return {};
//   const data: any = {};
//   Object.keys(obj).forEach(id => {
//     data[id] = data[id] || {};
//     Object.keys(obj[id]).forEach(key => {
//       if (obj && obj[id] && obj[id][key as IConfigType]) {
//         data[id][key] = Object.keys(obj[id][key as IConfigType]).map((dataId) => {
//           obj[id][key as IConfigType][dataId].id = dataId;
//           return obj[id][key as IConfigType][dataId];
//         });
//       }
//     });
//   });
//   return data;
// }

const convertGroupInputsToArray = (obj: {[key in IConfigType]: {[key: string]: IInputData}}): {[key in IConfigType]: IInputData[]} => {
  if (!obj) return {pay: [], todo: [], tobuy:[]};
  const data: any = {pay: [], todo: [], tobuy:[]};
  Object.keys(obj).forEach(key => {
    if (obj && obj[key as IConfigType]) {
      data[key] = Object.keys(obj[key as IConfigType]).map((dataId) => {
        obj[key as IConfigType][dataId].id = dataId;
        return obj[key as IConfigType][dataId];
      });
    }
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