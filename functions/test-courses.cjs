const admin = require('firebase-admin');
const serviceAccount = require('./courses-credentials.json');
if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const db = admin.firestore();
async function run() {
    const snap = await db.collection('courses').limit(15).get();
    snap.forEach(doc => {
        console.log(doc.id, "=> cover:", doc.data().cover, "coverImage:", doc.data().coverImage, "image:", doc.data().image);
    });
}
run();
