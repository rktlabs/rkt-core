
const log4js = require( 'log4js' )

const firebase = require( 'firebase-admin')
import {
  BootstrapService,
} from '../src'

if (firebase.apps.length === 0) {
  firebase.initializeApp({
      credential: firebase.credential.applicationDefault(),
      databaseURL: 'https://rkt-fant.firebaseio.com',
  });
}

log4js.configure({
  appenders: {
    console: { type: 'console' },
  },
  categories: { default: { appenders: ['console'], level: 'trace' } },
});


await BootstrapService.boot()

console.log('===========================================')
console.log('============BOOTED=========================')
console.log('===========================================')
