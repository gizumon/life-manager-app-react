/**
 * Manual operation
 *   : users migration
 */
function main () {
  const firebase = require('firebase-admin');
  const serviceKey = require('../../__local__/service-account-key.json');

  firebase.initializeApp({
    credential: firebase.credential.cert(serviceKey),
    databaseURL: '',
  });

  const userMap = {};
  const db = firebase.database();
  const ref = db.ref('users');
  ref.once('value').then((ss) => {
    const users = ss.val();
    Object.keys(users).filter(id => id.startsWith('-')).map((id) => {
      userMap[users[id].lineId] = id;
    });

    const refData = db.ref('data');
    refData.once('value').then(ss => {
      const data = ss.val();
      const newData = objectDeepLoop(data, (val) => {
        const id = userMap[val];
        return id ? id : val;
      });
      refData.update(newData).then(() => {
        console.log('Migration success');
      }).catch((e) => {
        console.log('Migration failed', e);
      });
    });
  }).catch(e => {
    console.error('Failed to connect firebase', e);
  });
};

const objectDeepLoop = (obj, fn) => {
  let result;
  if (Array.isArray(obj)) {
    result = [];
    obj.forEach((val, i) => {
      if (typeof val === 'object' || Array.isArray(val)) {
        result[i] = objectDeepLoop(val, fn);
      } else {
        result[i] = fn(val);
      }
    });
  } else {
    result = {};
    Object.keys(obj).forEach((key) => {
      if (typeof obj[key] === 'object' || Array.isArray(obj[key])) {
        result[key] = objectDeepLoop(obj[key], fn);
      } else {
        result[key] = fn(obj[key]);
      }
    });
  }
  return result;
};

main();
