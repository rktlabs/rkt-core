'use strict'
import * as admin from 'firebase-admin'
import { getConnectionProps } from '../../../../repositories/getConnectionProps'
const FieldValue = admin.firestore.FieldValue
import { TMakerParamsUpdate } from './types'

const COLLECTION_NAME = 'makers'

export class ParamUpdater {
    db: FirebaseFirestore.Firestore
    constructor() {
        this.db = getConnectionProps()
    }

    async updateMakerParams(makerId: string, makerPropsUpdate: TMakerParamsUpdate) {
        const entityRef = this.db.collection(COLLECTION_NAME).doc(makerId)

        const data = {
            ['params.poolCoins']: FieldValue.increment(makerPropsUpdate.poolCoinDelta),
            ['params.poolUnits']: FieldValue.increment(makerPropsUpdate.poolUnitDelta),
            ['params.k']: FieldValue.increment(makerPropsUpdate.kDelta),

            ['madeUnits']: FieldValue.increment(makerPropsUpdate.madeUnitsDelta),
            ['currentPrice']: makerPropsUpdate.currentPrice,
        }
        await entityRef.update(data)
    }
}
