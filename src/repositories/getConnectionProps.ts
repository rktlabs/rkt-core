// import * as dotenv from 'dotenv'
// import { ErrorResponse, ApiResponse } from '../util/types'
// dotenv.config()
import * as firebase from 'firebase-admin'

export const getConnectionProps = () => {
    // const credential = process.env.CREDENTIAL
    // const region: string = process.env.REGION || 'us-east-1'
    // const db_name = process.env.DB_NAME
    // const cluster = process.env.CLUSTER

    // const isMock = (process.env.MOCK && process.env.MOCK.toLowerCase() == 'yes') || false

    // if (!credential) throw composeError(500, 'Configuration Error (credential) - Contact Eliza Support')
    // if (!region) throw composeError(500, 'Configuration Error (region) - Contact Eliza Support')
    // if (!cluster) throw composeError(500, 'Configuration Error (cluster) - Contact Eliza Support')
    // if (!db_name) throw composeError(500, 'Configuration Error (db_name) - Contact Eliza Support')

    // const connectionProps: any = {
    //   region: region,
    //   cluster: cluster,
    //   database: db_name,
    //   passwordArn: credential,
    //   viewPrefix: isMock ? '' : 'vw_',
    // }
    let connectionProps = firebase.firestore()
    return connectionProps
}

// const composeError = (statusCode: number, message: string) => {
//   const errResponse: ErrorResponse = {
//     status: statusCode,
//     message: message,
//     path: '',
//   }
//   const apiResponse: ApiResponse = {
//     statusCode: errResponse.status,
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(errResponse),
//   }
//   return apiResponse
// }
