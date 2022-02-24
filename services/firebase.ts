/**
 * For server side
 */
import firebase from 'firebase-admin';
import { IConfig, ICategory, IMember, IFormData, IConfigType, FirebaseData, IToBuy, IToDo, IPay } from '../interfaces/index';
import FirebaseFactory from '../test/factory/firebaseFactory';
import Utils from './utils';
import getConfig from 'next/config';

const templateGroupId = '${groupId}';
const refsMap = {
    isUseFactory: 'triggers/isUseFactory',
    configs: 'masterdata/configs',
    categories: 'masterdata/categories',
    customCategories: `groups/${templateGroupId}/categories`, 
    users: 'users',
    groups: 'groups',
    inputs: 'data/inputs'
};

const { publicRuntimeConfig } = getConfig();
const { FIREBASE_ADMIN, FIREBASE_DB_URL} = publicRuntimeConfig;

export class FirebaseService {
    public app;
    public db: firebase.database.Database | undefined;
    public isInitialized = false;
    public configs: IConfig[] = [];
    public categories: ICategory[] = [];
    public customCategories: ICategory[] = [];
    public members: IMember[] = [];
    public inputItems: any[] = [];

    constructor() {
        this.app = firebase;
        if (firebase.apps.length) {
            firebase.app();
        } else {
            firebase.initializeApp({
                credential: firebase.credential.cert(FIREBASE_ADMIN),
                databaseURL: FIREBASE_DB_URL,
                databaseAuthVariableOverride: {
                    uid: "admin-client"
                },
            });
        }

        // init database
        this.db = firebase.database();
        return this;
    }

    public async initialize(): Promise<Boolean> {
        if (this.isInitialized) { return Promise.resolve(true); }
        
        // this.dataFactory();
        await this.setProperties();

        this.isInitialized = true;
        return Promise.resolve(true);
    }

    private dataFactory() {
        this.db?.ref(refsMap.isUseFactory).once('value').then((snapshot: firebase.database.DataSnapshot) => {
            const isUseFactory = snapshot.val();
            if (!isUseFactory) { return; }
            FirebaseFactory.prepareAll(this.db);
        });
    }

    private async setProperties() {
        this.categories = await this.getCategories();
        this.configs = await this.getConfigs();
        // this.members = await this.getMembers();
        // console.log('set properties: ', this.categories, this.configs, this.members);
    }

    // const getUser = (lineId: string): Promise<IMember> => {
    //     return new Promise<IMember>((resolve, reject) => {
    //         if (!this.db) {
    //             return reject('DB is not defined...');
    //         }
    //         if(!lineId) {
    //             return reject(`id is missing.`);
    //         }
    //         this.db?.ref(refsMap.users).child(lineId).once('value').then((snapshot) => {
    //             return resolve(snapshot.val());
    //         }).catch(e => {
    //             return reject(e);
    //         });
    //     });
    // };

    public async getUserById(id: string) {
        return new Promise<IMember>((resolve, reject) => {
            if (!this.db) {
                return reject('DB has not defined...');
            }
            if(!id) {
                return reject(`id is missing.`);
            }
            this.db?.ref(refsMap.users).child(id).once('value').then((snapshot) => {
                const m = snapshot.val() as IMember;
                return resolve(m);
            }).catch(e => {
                return reject(e);
            });
        });
    }

    public async getCategories(): Promise<ICategory[]> {
        return this.categories.length > 0 ? this.categories
             : await this.db?.ref(refsMap.categories).once('value').then((snapshot) => snapshot.val());
    }

    public async getCustomCategories(gid: string): Promise<ICategory[]> {
        const path = refsMap.customCategories.replace(templateGroupId, gid);
        return this.customCategories.length > 0 ? this.categories
             : await this.db?.ref(path).once('value').then((snapshot) => snapshot.val()) || [];
    }

    public async getConfigs(): Promise<IConfig[]> {
        return this.configs.length > 0 ? this.configs
             : await this.db?.ref(refsMap.configs).once('value').then((snapshot) => snapshot.val());
    }

    public async getInputs(): Promise<FirebaseData['data']['inputs'][]> {
        return this.inputItems.length > 0 ? this.inputItems
             : await this.db?.ref(refsMap.inputs).once('value').then((snapshot) => snapshot.val());
    }

    public async getToBuyInputs(gid: string): Promise<IToBuy[]> {
        const inputs = await this.getInputs();
        return (!inputs[gid] || !inputs[gid].tobuy) ? [] : Utils.convertObjectToArray<IToBuy>(inputs[gid].tobuy);
    }

    public async getGroupIdByUserId(lid: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            if (!this.db) {
                return reject('DB has not defined...');
            }
            if(!lid) {
                return reject(`id is missing.`);
            }
            this.db?.ref(refsMap.users).child(lid).once('value').then((snapshot) => {
                const m = snapshot.val() as IMember;
                return resolve(m ? m.groupId : '');
            }).catch(e => {
                return reject(e);
            });
        });
    }

    public getUserIdByLid = (lineId: string) => {
        return new Promise<string>((resolve, reject) => {
          if (!this.db) {
            return reject('DB is not defined...');
          }
          if (!lineId) {
            return reject('line id is not specified');
          }
          this.db.ref(refsMap.users).once('value').then(snapshot => {
            const users: { [key in string]: IMember } = snapshot.val();
            const userId = Object.keys(users).find((uid: string) => (users[uid].lineId === lineId));
            return resolve(userId);
            // return resolve(isExist);
          }).catch(err => {
            console.warn(err);
            return reject(err);
          });
        });
    };

    public makePageConfigs(configs: IConfig[], categories: ICategory[] = [], members: IMember[] = []): IConfig[] {
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
                // console.log('!!!check:', input.type, validate.type, validate.args);
            });
          });
        });
        return configs;
    }

    public async setInput(id: string = '', type: IConfigType, data: IFormData) {
        return new Promise<firebase.database.Reference>((resolve, reject) => {
            if (!id || !type) {
                return reject(`id or type is missing. id: ${id}: type: ${type}`);
            }
            const refName = `${refsMap.inputs}/${id}/${type}`;
            // console.log('set Input: ', this.db, refName, data);
            data['TIMESTAMP'] = firebase.database.ServerValue.TIMESTAMP;
            this.db?.ref(refName).push(data).then((e) => {
                // console.log(`show success: `, e);
                return resolve(e);
            }).catch((e) => {
                console.log(`show error: `, e);
                return reject(e);
            });
        });
    }

    public pushToBuyInput(groupId: string, data: Partial<IToBuy>): Promise<firebase.database.Reference> {
        return this.pushInput(groupId, 'tobuy', data);
    }

    private pushInput(
        groupId: string,
        type: string,
        data: Partial<IPay> | Partial<IToBuy> | Partial<IToDo>
    ): Promise<firebase.database.Reference> {
        return new Promise<firebase.database.Reference>((resolve, reject) => {
            if (!this.db) {
                return reject('DB has not defined...');
            }
            if (!groupId || !type) {
                return reject(`groupId or type is missing. groupId: ${groupId}: type: ${type}`);
            }
            const refName = `${refsMap.inputs}/${groupId}/${type}`;
            data['timestamp'] = firebase.database.ServerValue.TIMESTAMP as any as number;
            
            this.db.ref(refName).push(data).then(val => {
                return resolve(val);
            }).catch(err => {
                console.warn(err);
                return reject(err);
            });
        });
    };

    public pushMember(data: IMember): Promise<IMember> {
        return new Promise<IMember>((resolve, reject) => {
            if (!this.db || !data) {
                return reject('DB is not defined...');
            }
            data['timestamp'] = firebase.database.ServerValue.TIMESTAMP;
        
            const ref = this.db.ref(refsMap.users).push(data);
            const id = ref.key;
            ref.once('value').then((snapshot) => {
                return resolve({
                    id,
                    ...snapshot.val(),
                });
            }).catch(err => {
                console.warn(err);
                return reject(err);
            });
        });
    };

    public updateMember(data: IMember): Promise<IMember> {
        return new Promise<IMember>((resolve, reject) => {
            if (!this.db || !data) {
                return reject('DB is not defined...');
            }
            if (!data.id) {
                return reject('id is not defined...');
            }
            data['timestamp'] = firebase.database.ServerValue.TIMESTAMP;
        
            this.db.ref(refsMap.users).child(data.id).update(data).then((snapshot) => {
                return resolve(snapshot.val());
            }).catch(err => {
                console.warn(err);
                return reject(err);
            });
        });
    };
}