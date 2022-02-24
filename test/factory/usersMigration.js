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

  const db = firebase.database();
  const ref = db.ref('users');
  ref.once('value').then((ss) => {
    const users = ss.val();
    const userList = Object.keys(users).map((lid) => users[lid]);
    userList.forEach((u) => {
      ref.push(u).then((ref) => console.log('pushed: ', ref.key, u.name));
    });
  }).catch(e => {
    console.error('Failed to connect firebase', e);
  });
};

main();
