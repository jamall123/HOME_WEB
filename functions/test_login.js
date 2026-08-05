const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'jhomeweb-9ee56' });

async function run() {
  const db = admin.firestore();
  await db.collection('courses_credentials').doc('testuser').set({
    password: 'correctpassword',
    role: 'student',
    courseId: 'testCourse'
  });
  console.log("Created test user");
}
run().catch(console.error);
