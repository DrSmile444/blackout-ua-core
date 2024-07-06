import * as firebaseAdmin from 'firebase-admin';
// import * as serviceAccount from './path/to/serviceAccountKey.json';
// TODO add these credentials
const serviceAccount = {};

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount as firebaseAdmin.ServiceAccount),
  databaseURL: 'https://<your-database-name>.firebaseio.com',
});

export default firebaseAdmin;
