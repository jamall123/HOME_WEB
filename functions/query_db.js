const admin = require('firebase-admin');
admin.initializeApp({ projectId: "jhomeweb-9ee56" });
const db = admin.firestore();
async function run() {
  const admins = await db.collection('courses_credentials').where('role', '==', 'admin').get();
  admins.forEach(doc => console.log(doc.id, doc.data()));
  const students = await db.collection('courses_credentials').where('role', '==', 'student').limit(2).get();
  students.forEach(doc => console.log(doc.id, doc.data()));
}
run();
