"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConnectionProps = void 0;
const firebase = require("firebase-admin");
const getConnectionProps = () => {
    let connectionProps = firebase.firestore();
    return connectionProps;
};
exports.getConnectionProps = getConnectionProps;
