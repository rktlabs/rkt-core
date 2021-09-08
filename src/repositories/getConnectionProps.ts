import * as firebase from 'firebase-admin'

export const getConnectionProps = () => {
    let connectionProps = firebase.firestore()
    return connectionProps
}
