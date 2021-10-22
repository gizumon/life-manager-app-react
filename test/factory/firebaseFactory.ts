import firebase from 'firebase/app';
import CONST from '../../services/constants';

const data = {
    masterdata: {
        categories: CONST.payCategories.concat(CONST.buyCategories),
        configs: CONST.configs
    }
}

namespace FirebaseFactory {
  async function updateIsUseFactory(db: firebase.database.Database) {
    await db.ref('triggers/isUseFactory').set(false);
  }
  
  async function prepareCategories(db: firebase.database.Database) {
    await db.ref('masterdata/categories').set(data.masterdata.categories);
  }

  async function prepareConfigs(db: firebase.database.Database) {
    await db.ref('masterdata/configs').set(data.masterdata.configs);
  }

  export async function prepareAll(db: firebase.database.Database) {
    console.log('Run firebase factory', db);
    await prepareCategories(db);
    await prepareConfigs(db);
    await updateIsUseFactory(db);
  }
}

export default FirebaseFactory;
