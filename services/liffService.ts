// TODO: Add Liff service

import liff from '@line/liff';
import { Config } from '@line/liff/dist/lib/init';
export default class LiffApp {
    constructor(config: Config) {
        this.initialize(config);
    }
    initialize(config: Config) {
        liff.init(config);
    }

}
