const admin = require('firebase-admin');
admin.initializeApp({ projectId: "jhomeweb-9ee56" });
const db = admin.firestore();
async function run() {
  try {
    const admins = await db.collection('courses_credentials').where('role', '==', 'admin').get();
    console.log("=== ADMINS ===");
    admins.forEach(doc => console.log(doc.id, doc.data()));
    const students = await db.collection('courses_credentials').where('role', '==', 'student').limit(2).get();
    console.log("=== STUDENTS ===");
    students.forEach(doc => console.log(doc.id, doc.data()));
  } catch(e) {
    console.error(e.message);
  }
}
run();
