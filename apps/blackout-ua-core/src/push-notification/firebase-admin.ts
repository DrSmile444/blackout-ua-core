import * as process from 'node:process';
import * as firebaseAdmin from 'firebase-admin';

const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN) as firebaseAdmin.ServiceAccount;

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  // databaseURL: 'https://<your-database-name>.firebaseio.com',
});

export default firebaseAdmin;
