const admin = require("firebase-admin");
const serviceAccount = require("./functions/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
async function run() {
  const doc = await db.collection("course_credentials").doc("jlal8558").get();
  console.log("jlal8558 data:", doc.data());
}
run();
