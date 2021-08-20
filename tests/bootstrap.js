
const log4js = require( 'log4js' )

const firebase = require( 'firebase-admin')
if (firebase.apps.length === 0) {
  const serviceAccount = require('./permissions.json');
  firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: "https://fantx-test.firebaseio.com"
  });
}

log4js.configure({
  appenders: {
    console: { type: 'console' },
  },
  categories: { default: { appenders: ['console'], level: 'trace' } },
});
