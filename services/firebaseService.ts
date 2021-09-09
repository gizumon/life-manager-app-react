/**
 * Deprecated: Replaced to useFirebese.tsx
 */

import CONST from './constService';
import firebase from 'firebase/app';
import 'firebase/database';
import { IConfig, ICategory, IMember, IFormData, IConfigType } from '../interfaces/index';
import FirebaseFactory from '../test/factory/firebaseFactory';
import Utils from './utilsService';

const refsMap = {
    isUseFactory: 'triggers/isUseFactory',
    configs: 'masterdata/configs',
    categories: 'masterdata/categories',
    members: 'data/members',
    inputs: 'data/inputs'
}

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
    }

    public async initialize(): Promise<Boolean> {
        if (this.isInitialized) { return Promise.resolve(true); }
        
        this.dataFactory();
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
        this.members = await this.getMembers();
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

    public async getInputs(): Promise<any[]> {
        return this.inputItems.length > 0 ? this.inputItems
                                          : await this.db?.ref(refsMap.inputs).once('value').then((snapshot) => snapshot.val());
    }

    // TODO: Replace real data
    public async getMembers(): Promise<IMember[]> {
        // return this.members || await this.db?.ref(refsMap.members).once('value').then((snapshot) => snapshot.val());
        return [
            {
              id: '1',
              lineId: 'dummy_1_lineId',
              name: 'Tomoatsu',
              picture: 'https://profile.line-scdn.net/0hknDp_4O4NEF5CSIv6TlLFkVMOiwOJzIJAW0pd1gAbiNQOHUXEGZ6cFsJOHcDO3AfEWosJFsLbnVW',
              groupId: 'dummy_group_1'
            },
            {
              id: '2',
              lineId: 'dummy_2_lineId',
              name: 'Shoko',
              picture: 'https://cdn.vuetifyjs.com/images/lists/2.jpg',
              groupId: 'dummy_group_1'
            },
        ];
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
          })
        })
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