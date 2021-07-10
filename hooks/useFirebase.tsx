import { createContext, FC, useContext, useEffect, useState } from "react"
// import CONST from '../services/constService';
import firebase from 'firebase/app';
import 'firebase/database';
import { IConfig, ICategory, IMember, IGroup } from '../interfaces/index';
// import FirebaseFactory from '../test/factory/firebaseFactory';
import Utils from '../services/utilsService';

export const refsMap = {
    isUseFactory: 'triggers/isUseFactory',
    configs: 'masterdata/configs',
    categories: 'masterdata/categories',
    members: 'data/members',
    groups: 'data/groups',
    inputs: 'data/inputs'
}

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

type IDataStates = {
  configs: IConfig[];
  categories: ICategory[];
  members: IMember[];
  groups: IGroup[];
  inputs: any[];
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
}

export const useFirebase = (): IUseFirebaseReturn => {
  const firebaseApp = useContext(FirebaseContext);
  const [states, setStates] = useState<IDataAndFlagStates>({isRunInitialized: false, isInitialized: false, configs: [], categories: [], members: [], groups: [], inputs: []});
  DB = firebaseApp?.database();

  if (firebaseApp && DB && !states.isRunInitialized) {
    setStates((data) => { return { ...data, isRunInitialized: true } });
    asyncSetProperties().then((items: IDataStates) => {
      const processedConfigs = makePageConfigs(items.configs, items.categories, items.members);
      setStates((data) => {
        return {
          ...data,
          isInitialized: true,
          ...items,
          configs: processedConfigs,
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
  };
}

const asyncSetProperties = (): Promise<IDataStates> => {
  return new Promise(async (resolve, reject) => {
    const states: {[key in string]: any} = {};
    for (let key of ['configs', 'categories', 'members', 'groups', 'inputs']) {
      const items = await getData(refsMap[key as (keyof typeof refsMap)]).catch((err) => { reject(err); });
      states[key] = items;
    }
    resolve(states as IDataStates);
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
    data['TIMESTAMP'] = firebase.database.ServerValue.TIMESTAMP;
    
    DB.ref(refName).push(data).then(val => {
      return resolve(val);
    }).catch(err => {
      console.warn(err);
      return reject();
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
