import * as firebase from 'firebase-admin'

export const getConnectionProps = () => {
    if (firebase.apps.length === 0) {
        firebase.initializeApp({
            credential: firebase.credential.applicationDefault(),
            databaseURL: 'https://rkt-fant.firebaseio.com',
        })
    }

    let connectionProps = firebase.firestore()
    return connectionProps
}
