const firebase = require('firebase/app');
require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyCJ8I06UGVBOJdnU4Upp_EekS7txwX-fBg",
  authDomain: "jhomeweb-9ee56.firebaseapp.com",
  projectId: "jhomeweb-9ee56"
};
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
db.collection('courses_credentials').get().then(snap => {
    snap.docs.forEach(doc => {
        console.log(doc.id, '=>', doc.data());
    });
    process.exit(0);
});
