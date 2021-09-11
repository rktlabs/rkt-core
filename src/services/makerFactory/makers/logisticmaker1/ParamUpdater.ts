'use strict'
import * as admin from 'firebase-admin'
import { getConnectionProps } from '../../../../repositories/getConnectionProps'
import { TMakerParamsUpdate } from './types'
const FieldValue = admin.firestore.FieldValue

const COLLECTION_NAME = 'makers'

export class ParamUpdater {
    db: FirebaseFirestore.Firestore
    constructor() {
        this.db = getConnectionProps()
    }

    async updateMakerParams(makerId: string, makerPropsUpdate: TMakerParamsUpdate) {
        const entityRef = this.db.collection(COLLECTION_NAME).doc(makerId)

        const data = {
            madeUnits: FieldValue.increment(makerPropsUpdate.madeUnitsDelta),
            currentPrice: makerPropsUpdate.currentPrice,
        }
        await entityRef.update(data)
    }
}
