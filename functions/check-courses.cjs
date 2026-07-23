const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
admin.firestore().collection('courses').get().then(snap => {
  console.log("Courses in Firestore:");
  snap.docs.forEach(d => console.log(d.id, d.data().title));
  process.exit(0);
}).catch(console.error);
