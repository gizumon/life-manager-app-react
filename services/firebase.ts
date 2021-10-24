/**
 * Deprecated: Replaced to useFirebese.tsx
 */
import CONST from './constants';
import firebase from 'firebase/app';
import 'firebase/database';
import { IConfig, ICategory, IMember, IFormData, IConfigType, FirebaseData, IToBuy } from '../interfaces/index';
import FirebaseFactory from '../test/factory/firebaseFactory';
import Utils from './utils';

const refsMap = {
    isUseFactory: 'triggers/isUseFactory',
    configs: 'masterdata/configs',
    categories: 'masterdata/categories',
    members: 'users',
    groups: 'groups',
    inputs: 'data/inputs'
};

export class FirebaseService {
    public app;
    public db: firebase.database.Database | undefined;
    public isInitialized = false;
    public configs: IConfig[] = [];
    public categories: ICategory[] = [];
    public members: IMember[] = [];
    public inputItems: any[] = [];

    constructor() {
        this.app = firebase;
        !firebase.apps.length
          ? firebase.initializeApp(CONST.firebaseConfig)
          : firebase.app();

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
            FirebaseFactory.prepareAll(this.db as firebase.database.Database);
        });
    }

    private async setProperties() {
        this.categories = await this.getCategories();
        this.configs = await this.getConfigs();
        // this.members = await this.getMembers();
        console.log('set properties: ', this.categories, this.configs, this.members);
    }

    public async getCategories(): Promise<ICategory[]> {
        return this.categories.length > 0 ? this.categories
             : await this.db?.ref(refsMap.categories).once('value').then((snapshot) => snapshot.val());
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
        console.log('input data: ', inputs);
        return (!inputs[gid] || !inputs[gid].tobuy) ? [] : Utils.convertObjectToArray<IToBuy>(inputs[gid].tobuy);
    };

    public async getGroupIdByUserId(lid: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            if (!this.db) {
                return reject('DB has not defined...');
            }
            if(!lid) {
                return reject(`id is missing.`);
            }
            this.db?.ref(refsMap.members).child(lid).once('value').then((snapshot) => {
                const m = snapshot.val() as IMember;
                console.log('get group id by user id', m);
                return resolve(m ? m.groupId : '');
            }).catch(e => {
                return reject(e);
            });
        });
    }

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
                console.log('!!!check:', input.type, validate.type, validate.args);
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
            console.log('set Input: ', this.db, refName, data);
            data['TIMESTAMP'] = firebase.database.ServerValue.TIMESTAMP;
            this.db?.ref(refName).push(data).then((e) => {
                console.log(`show success: `, e);
                return resolve(e);
            }).catch((e) => {
                console.log(`show error: `, e);
                return reject(e);
            });
        });
    }
}