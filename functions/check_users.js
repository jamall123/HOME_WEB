import admin from 'firebase-admin';
admin.initializeApp({ projectId: 'jhome-6de55' });
admin.auth().listUsers(10).then(res => {
  console.log(JSON.stringify(res.users.map(u => ({ email: u.email, customClaims: u.customClaims })), null, 2));
}).catch(console.error);
