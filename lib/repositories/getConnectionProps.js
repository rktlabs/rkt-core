'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConnectionProps = void 0;
const firebase = require("firebase-admin");
const getConnectionProps = () => {
    if (firebase.apps.length === 0) {
        firebase.initializeApp({
            credential: firebase.credential.applicationDefault(),
            databaseURL: 'https://rkt-fant.firebaseio.com',
        });
    }
    let connectionProps = firebase.firestore();
    return connectionProps;
};
exports.getConnectionProps = getConnectionProps;
