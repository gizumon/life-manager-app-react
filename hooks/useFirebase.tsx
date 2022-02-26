import { createContext, FC, useContext, useEffect, useState } from "react";
// import CONST from '../services/constService';
import firebase from 'firebase/app';
import 'firebase/database';
import { IConfig, ICategory, IMember, IGroup, IInputData, IConfigType, IThemeSetting } from '../interfaces/index';
import FirebaseFactory from '../test/factory/firebaseFactory';
import Utils from '../services/utils';
import * as _ from 'lodash';
import { useSelector, useDispatch } from 'react-redux';
import { FirebaseState, setFirebase } from '../ducks/firebase/slice';
import { StoreState } from '../ducks/createStore';
import getConfig from 'next/config';

const templateGroupId = '${groupId}';
export const refsMap = {
    isUseFactory: 'triggers/isUseFactory',
    configs: 'masterdata/configs',
    customConfigs: `groups/${templateGroupId}/configs`, 
    categories: 'masterdata/categories',
    customCategories: `groups/${templateGroupId}/categories`, 
    members: 'users',
    groups: 'groups',
    inputs: 'data/inputs'
} as const;
type IRefsKeys = keyof typeof refsMap;

export const shouldUpdateStateNamesMap: {[key in IRefsKeys]: string[]} = {
  isUseFactory: ['configs', 'categories'],
  configs: ['configs'],
  customConfigs: ['configs'], 
  categories: ['categories', 'configs'],
  customCategories: ['categories', 'configs'], 
  members: [],
  groups: ['groups'],
  inputs: ['inputs'],
};

let DB: firebase.database.Database | undefined;

const FirebaseContext = createContext<typeof firebase | undefined>(undefined);
export const FirebaseProvider: FC = ({ children }) => {
  const { publicRuntimeConfig } = getConfig();
  const [app, setApp] = useState<typeof firebase>();

  useEffect(() => {
    let unmounted = false;
    const func = async () => {
      const firebaseApp = (await import('firebase/app')).default;
      if (firebase.apps.length < 1) {
        await firebaseApp.initializeApp(publicRuntimeConfig.FIREBASE as Object);
      } else {
        firebase.app();
      }
      if (!unmounted) {
        setApp(firebaseApp);
      }
    };
    func();
    const cleanup = () => {
      unmounted = true;
    };
    return cleanup;
  }, []);

  return (
    <FirebaseContext.Provider value={app}>
      {children}
    </FirebaseContext.Provider>
  );
};

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
  categories: ICategory[];
  groups: IGroup[];
  groupMembers: IMember[];
  groupTheme?: IThemeSetting;
  inputs: {[key in IConfigType]: IInputData[]};
}

type IDataAndFlagStates = IDataStates & {
  isRunInitialized: boolean;
  isInitialized: boolean;
}

export type IFirebaseDataStates = IDataAndFlagStates & IActivateDataStates; 

export type IUseFirebaseReturn = IFirebaseDataStates & {
  firebase?: typeof firebase;
  db?: firebase.database.Database;
  getData?: (refPath: string) => Promise<any[]>;
  setData?: (refPath: string, data: any) => Promise<void>;
  pushData?: (refPath: string, data: any) => Promise<void>;
  pushInput?: (groupId: string, type: string, data: any) => Promise<firebase.database.Reference>;
  deleteInput?: (groupId: string, type: IConfigType, id: string) => Promise<void>;
  // pushMember?: (data: IMember) => Promise<firebase.database.Reference>;
  // getMember?: (lineId: string) => Promise<IMember>;
  // updateMember?: (lineId: string, data: IMember) => Promise<void>;
  pushGroup?: (data?: IGroup) => Promise<firebase.database.Reference>;
  getGroupMember?: (groupId: string, lineId: string) => Promise<IMember>;
  updateGroupMember?: (groupId: string, data: Partial<IMember>) => Promise<firebase.database.Reference>;
  isExistGroup?: (groupId: string) => Promise<boolean>;
  isExistMember?: (lineId: string) => Promise<boolean>;
  activateGroup?: (groupId: string) => Promise<void>;
  makePageConfigs?: (configs: IConfig[], categories: ICategory[], members: IMember[]) => IConfig[];
  updateCustomCategories?: (groupId: string, data: ICategory[]) => Promise<firebase.database.Reference>,
  updateCustomConfigs?: (groupId: string, data: IConfig[]) => Promise<firebase.database.Reference>,
  updateCustomThemeSetting?: (groupId: string, data: IThemeSetting) => Promise<firebase.database.Reference>,
}

export const useFirebase = (): IUseFirebaseReturn => {
  const dispatch = useDispatch();
  const firebaseApp = useContext(FirebaseContext);
  const states = useSelector<StoreState, FirebaseState>(state => state.firebase);
  DB = firebaseApp?.database();

  const activateGroup = async (groupId: string) => {
    if (!DB || !groupId || states.configs.length < 1 || states.isGroupActivated) { return; }
    const group: IGroup = (await DB.ref(refsMap.groups).child(groupId).once('value'))?.val();

    if (!group || !group.members) { return; }
    const groupMembers = convertObjectToArray(group.members as {[key: string]: IMember}) as IMember[];
    const groupTheme = group.themeSetting;
    const customConfigs: IConfig[] = (await DB?.ref(refsMap.customConfigs.replace(templateGroupId, groupId)).once('value'))?.val() || [];
    const customCategories: ICategory[] = (await DB?.ref(refsMap.customCategories.replace(templateGroupId, groupId)).once('value'))?.val() || [];
    const inputs = convertGroupInputsToArray((await DB?.ref(refsMap.inputs).child(groupId).once('value')).val() as {[key in IConfigType]: {[key: string]: IInputData}});

    const newConfigs = customConfigs.length > 0 ? customConfigs.map((config, index) => _.merge({}, states.configs[index], config)) : states.configs;
    const newCategories = customCategories.length > 0 ? customCategories.map((category, index) => _.merge({}, states.categories[index], category)) : states.categories;
    dispatch(setFirebase({
      ...states,
      isRunInitialized: true,
      isInitialized: true,
      isGroupActivated: true,
      configs: makePageConfigs(newConfigs, newCategories, groupMembers),
      categories: newCategories,
      groups: [group],
      groupMembers: groupMembers,
      groupTheme: groupTheme,
      inputs: inputs || {pay: [], todo: [], tobuy:[]},
    }));
  };

  const triggerOnActivate = () => {
    dispatch(setFirebase({ ...states, isGroupActivated: false }));    
  };

  const runActivateWrapper = <T, K extends {} >(promiseFn: any): (args: T) => K => {
    return (...args) => {
      return promiseFn(...args).then(() => triggerOnActivate());
    };
  };

  if (firebaseApp && DB && !states.isRunInitialized) {
    dataFactory();
    dispatch(setFirebase({...states, isRunInitialized: true}));
    asyncSetProperties().then((items: IFirebaseData) => {
      dispatch(setFirebase({
        ...states,
        isRunInitialized: true,
        isInitialized: true,
        configs: items.configs,
        categories: states.categories.length > 0 ? states.categories: items.categories,
      }));
    });
  }

  return {
    firebase: firebaseApp,
    db: DB,
    ...states,
    getData: getData,
    setData: setData,
    pushData: pushData,
    pushInput: runActivateWrapper(pushInput),
    deleteInput: runActivateWrapper(deleteInput),
    // getMember: getMember,
    // updateMember: updateMember,
    pushGroup: pushGroup,
    getGroupMember: getGroupMember,
    updateGroupMember: runActivateWrapper(updateGroupMember),
    isExistGroup: isExistGroup,
    isExistMember: isExistMember,
    activateGroup: activateGroup,
    makePageConfigs: makePageConfigs,
    updateCustomCategories: runActivateWrapper(updateCustomCategories),
    updateCustomConfigs: runActivateWrapper(updateCustomConfigs),
    updateCustomThemeSetting: runActivateWrapper(updateCustomThemeSetting),
  };
};

const asyncSetProperties = (): Promise<IFirebaseData> => {
  return new Promise(async (resolve, reject) => {
    const obj: {[key in string]: any} = {};
    for (let key of ['configs', 'categories',  'inputs']) {
      const items = await getData(refsMap[key as (keyof typeof refsMap)]).catch((err) => { reject(err); });
      obj[key] = items;
    }
    resolve(obj as IFirebaseData);
  });
};

const getData = async (refPath: string): Promise<any[]> => {
  return await DB?.ref(refPath).once('value').then((snapshot) => snapshot.val());
};

const setData = async (refPath: string, data: any): Promise<void> => {
  return await DB?.ref(refPath).set(data).then((value) => value).catch(err => { console.warn(err); return err; });
};

const pushData = async (refPath: string, data: any): Promise<void> => {
  return await DB?.ref(refPath).push(data).then((value) => value).catch(err => { console.warn(err); return err; });
};

const pushInput = (groupId: string, type: string, data: any): Promise<firebase.database.Reference> => {
  return new Promise<firebase.database.Reference>((resolve, reject) => {
    if (!DB) {
      return reject('DB is not defined...');
    }
    if (!groupId || !type) {
      return reject(`groupId or type is missing. groupId: ${groupId}: type: ${type}`);
    }
    const refName = `${refsMap.inputs}/${groupId}/${type}`;
    data['timestamp'] = firebase.database.ServerValue.TIMESTAMP;
    
    DB.ref(refName).push(data).then(val => {
      return resolve(val);
    }).catch(err => {
      console.warn(err);
      return reject(err);
    });
  });
};

const deleteInput = (groupId: string, type: IConfigType, id: string): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    if (!DB) {
      return reject('DB is not defined...');
    }
    if (!type || !groupId || !id) {
      return reject(`type or groupId or record id is missing. groupId: ${groupId}, type: ${type}, id: ${id}`);
    }

    const refName = `${refsMap.inputs}/${groupId}/${type}`;
    DB.ref(refName).child(id).remove((err) => {
      return !err ? resolve() : reject(); 
    });
  });
};

// // Move to backend 
// const getMember = (lineId: string): Promise<IMember> => {
//   return new Promise<IMember>((resolve, reject) => {
//     if (!DB) {
//       return reject('DB is not defined...');
//     }
//     if(!lineId) {
//       return reject(`id is missing.`);
//     }
//     DB?.ref(refsMap.members).child(lineId).once('value').then((snapshot) => {
//       return resolve(snapshot.val());
//     }).catch(e => {
//       return reject(e);
//     });
//   });
// };

// const updateMember = (lineId: string, data: IMember): Promise<void> => {
//   return new Promise<void>((resolve, reject) => {
//     if (!DB || !lineId || !data) {
//       return reject('DB is not defined...');
//     }
//     data['timestamp'] = firebase.database.ServerValue.TIMESTAMP;

//     DB.ref(refsMap.members).child(lineId).update(data).then(() => {
//       return resolve();
//     }).catch(err => {
//       console.warn(err);
//       return reject(err);
//     });
//   });
// };

const pushGroup = (data: IGroup = {}): Promise<firebase.database.Reference> => {
  return new Promise<firebase.database.Reference>((resolve, reject) => {
    if (!DB) {
      return reject('DB is not defined...');
    }
    data['timestamp'] = firebase.database.ServerValue.TIMESTAMP;
    DB.ref(refsMap.groups).push(data).then(val => {
      return resolve(val);
    }).catch(err => {
      console.warn(err);
      return reject(err);
    });
  });
};

const getGroupMember = (groupId: string, id: string): Promise<IMember> => {
  return new Promise<IMember>((resolve, reject) => {
    if (!DB) return reject('DB is not defined...');
    if (!groupId) return reject('groupId is not defined...');
    if (!id) return reject('lineId is not defined...');
    DB.ref(refsMap.groups).child(`${groupId}/members`).child(id).once('value').then(snapshot => {
      return resolve(snapshot.val());
    }).catch(err => {
      console.warn(err);
      return reject(err);
    });
  });
};

const updateGroupMember = (groupId: string, data: Partial<IMember>) => {
  return new Promise<firebase.database.Reference>((resolve, reject) => {
    if (!DB) {
      return reject('DB is not defined...');
    }
    if (!data.id) {
      return reject('id is not defined...');
    }
    if (!groupId) {
      return reject('group id is not defined...');
    }
    data['timestamp'] = firebase.database.ServerValue.TIMESTAMP;
    DB.ref(refsMap.groups).child(`${groupId}/members`).child(data.id).update(data).then(val => {
      return resolve(val);
    }).catch(err => {
      console.warn(err);
      return reject(err);
    });
  });
};

const isExistGroup = (groupId: string = '') => {
  return new Promise<boolean>((resolve, reject) => {
    if (!DB) {
      return reject('DB is not defined...');
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
};

const isExistMember = (lineId: string) => {
  return new Promise<boolean>((resolve, reject) => {
    if (!DB) {
      return reject('DB is not defined...');
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
};

const makePageConfigs = (configs: IConfig[], categories: ICategory[] = [], members: IMember[] = []): IConfig[] =>  {
  const newConfigs = configs.map((config) => _.cloneDeep(config));
  const setTodayList = ['doDueDate', 'buyDueDate'];
  const setMembersList = ['payedFor', 'payedBy'];
  const setMembersWithAllList = ['doBy', 'buyBy'];
  const setMemberIdList = ['payedFor'];
  newConfigs.forEach((config) => {
    config.inputs.forEach((input) => {
      input.dataList = setMembersList.includes(input.id) ? members
                     : setMembersWithAllList.includes(input.id) ? members.concat({id: 'ALL', name: '全員'})
                     : input.id === 'payedCategory' ? categories.filter((category) => category.type === 'pay')
                     : input.id === 'doCategory' ?  categories.filter((category) => category.type === 'todo')
                     : input.id === 'buyCategory' ?  categories.filter((category) => category.type === 'tobuy')
                     : [];
      input.model    = setMemberIdList.includes(input.id) ? members.map((member) => member.id)
                     : setTodayList.includes(input.id) ? Utils.formatDate(new Date())
                     : input.model;
      input.validates?.forEach((validate) => {
          validate.args = input.type === 'select' && validate.type === 'isInclude' ? input.dataList?.map(data => data.id)
                        : input.type === 'select-btns' && validate.type === 'isInclude' ? input.dataList?.map(data => data.id)
                        : input.type === 'multi-check' && validate.type === 'isIncludeAll' ? input.dataList?.map(data => data.id)
                        : validate.args;
      });
    });
  });
  return newConfigs;
};

const convertObjectToArray = (obj: {[key: string]: IMember | IGroup}): (IMember | IGroup)[] => {
  if (!obj) return [];
  const data = Object.assign({}, obj);
  return Object.keys(data).map((key) => {
    data[key].id = key;
    return data[key];
  });
};

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
};

const updateCustomCategories = (groupId: string, data: ICategory[]) => {
  return new Promise<firebase.database.Reference>((resolve, reject) => {
    if (!DB) {
      return reject('DB is not defined...');
    }
    if (!groupId || !data) {
      return reject('lineId is not defined...');
    }

    DB?.ref(refsMap.customCategories.replace(templateGroupId, groupId)).set(data).then(val => {
      return resolve(val);
    }).catch(err => {
      console.warn(err);
      return reject(err);
    });
  });
};

const updateCustomConfigs = (groupId: string, data: IConfig[]) => {
  return new Promise<firebase.database.Reference>((resolve, reject) => {
    if (!DB) {
      return reject('DB is not defined...');
    }
    if (!groupId || !data) {
      return reject('lineId is not defined...');
    }

    DB?.ref(refsMap.customConfigs.replace(templateGroupId, groupId)).set(data).then(val => {
      return resolve(val);
    }).catch(err => {
      console.warn(err);
      return reject(err);
    });
  });
};

const updateCustomThemeSetting = (groupId: string, data: IConfig[]) => {
  return new Promise<firebase.database.Reference>((resolve, reject) => {
    if (!DB) {
      return reject('DB is not defined...');
    }
    if (!groupId || !data) {
      return reject('lineId is not defined...');
    }

    DB?.ref(refsMap.groups).child(groupId).child('themeSetting').update(data).then(val => {
      return resolve(val);
    }).catch(err => {
      console.warn(err);
      return reject(err);
    });
  });
};

const dataFactory = () => {
  DB?.ref(refsMap.isUseFactory).once('value').then((snapshot: firebase.database.DataSnapshot) => {
      const isUseFactory = snapshot.val();
      if (!isUseFactory) { return; }
      FirebaseFactory.prepareAll(DB);
  });
};

// const setListener = (groupId: string): {[key in IRefsKeys]: firebase.database.Reference } => {
//   const refs: {[key: string]: firebase.database.Reference } = {};
//   Object.keys(refsMap).forEach(key => {
//     if (!DB) { return; }
//     const refKey = key as IRefsKeys;
//     refs[refKey] = DB.ref(refsMap[refKey].replace(templateGroupId, groupId));
//     refs[refKey].on('value', (snapShot) => {
//       // update data
//       snapShot.val();
//     });
//   });
//   return refs as {[key in IRefsKeys]: firebase.database.Reference };
// }

// const onUpdateData = (key: IRefsKeys, data: IFirebaseData[keyof IFirebaseData]) => {
//   const updateData: {[key in keyof IFirebaseDataStates]: any }  = {};
//   const states = useSelector<StoreState, FirebaseState>(state => state.firebase);
//   shouldUpdateStateNamesMap[key].forEach((name) => {
//     updateData[name] = data;
//   })
// }
