import admin from 'firebase-admin';
import { readFileSync } from 'fs';
const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
async function run() {
  const users = await admin.firestore().collection('users').limit(5).get();
  users.forEach(doc => console.log(doc.id, doc.data()));
}
run().catch(console.error);
