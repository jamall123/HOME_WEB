const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
async function run() {
  const doc = await db.collection("courses_credentials").doc("jlal8558").get();
  console.log("courses_credentials data:", doc.data());
}
run();
