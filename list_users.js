const admin = require('./functions/node_modules/firebase-admin');
const serviceAccount = require('./functions/service-account.json'); // if it exists, or use default credentials

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

admin.auth().listUsers(100)
  .then((listUsersResult) => {
    listUsersResult.users.forEach((userRecord) => {
      console.log('user', userRecord.toJSON());
    });
  })
  .catch((error) => {
    console.log('Error listing users:', error);
  });
