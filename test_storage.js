const firebase = require('firebase/app');
require('firebase/storage');

const firebaseConfig = {
  apiKey: "AIzaSyCJ8I06UGVBOJdnU4Upp_EekS7txwX-fBg",
  authDomain: "jhomeweb-9ee56.firebaseapp.com",
  projectId: "jhomeweb-9ee56",
  storageBucket: "jhomeweb-9ee56.firebasestorage.app"
};
firebase.initializeApp(firebaseConfig);

const storage = firebase.storage();
const ref = storage.ref().child('test.txt');
ref.putString('test').then(() => {
    console.log('Storage success!');
    process.exit(0);
}).catch(err => {
    console.error('Storage error:', err);
    process.exit(1);
});
