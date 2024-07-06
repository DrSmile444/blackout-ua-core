// import * as firebaseAdmin from 'firebase-admin';
// import * as serviceAccount from './path/to/serviceAccountKey.json';
// TODO add these credentials
// const serviceAccount = {};
//
// firebaseAdmin.initializeApp({
//   credential: firebaseAdmin.credential.cert(serviceAccount as firebaseAdmin.ServiceAccount),
//   databaseURL: 'https://<your-database-name>.firebaseio.com',
// });

import type { Message } from 'firebase-admin/lib/messaging/messaging-api';

const firebaseAdmin = {
  messaging: () => ({
    send: (message: Message) => Promise.resolve('mocked'),
  }),
};

export default firebaseAdmin;
