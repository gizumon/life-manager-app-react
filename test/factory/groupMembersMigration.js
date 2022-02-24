/**
 * Manual operation
 *   : group member migration
 */
function main () {
  const firebase = require('firebase-admin');
  const serviceKey = require('../../__local__/service-account-key.json');

  firebase.initializeApp({
    credential: firebase.credential.cert(serviceKey),
    databaseURL: '',
  });

  const db = firebase.database();
  const ref = db.ref('groups');
  ref.once('value').then((ss) => {
    const groups = ss.val();
    Object.keys(groups).forEach((gid) => {
      const group = groups[gid];
      Object.keys(group.members).forEach((mid) => {
        const refUser = db.ref('users');
        refUser.once('value').then((ss2) => {
          const users = ss2.val();
          const userArray = Object.keys(users).map((uid) => {
            console.log(uid, uid.startsWith('-'));
            if (uid.startsWith('-')) {
              users[uid].id = uid;
              return users[uid];
            }
          });
          const member = group.members[mid];
          // console.log(member, userArray);
          const targetUser = userArray.filter(u => !!u).find((u) => u?.lineId === member.lineId);
          if (targetUser && targetUser.id) {
            console.log('gid', targetUser, gid);
            db.ref(`groups/${gid}/members/${targetUser.id}`).update({
              id: targetUser.id,
              groupId: gid,
              name: targetUser.name,
              picture: targetUser.picture,
            }).then(sn => console.log('updated: ', sn)).catch(e => console.log(e));
          }
          // console.log('member', {
          //   id: targetUser?.id,
          //   groupId: targetUser?.groupId,
          //   name: targetUser?.name,
          // });
        });
      });
    });
    userList.forEach((u) => {
      ref.push(u).then((ref) => console.log('pushed: ', ref.key, u.name));
    });
  }).catch(e => {
    console.error('Failed to connect firebase', e);
  });
};

main();
