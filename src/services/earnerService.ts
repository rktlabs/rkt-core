'use strict'
import { DateTime } from 'luxon'

import { AssetRepository, EarnerRepository, EarningsRepository } from '../repositories'
import { Earner, TEarning, TNewEarner } from '../models'
import { DuplicateError } from '../errors'
import { IEventPublisher } from '../services'

export class EarnerService {
    private earnerRepository: EarnerRepository
    private earningsRepository: EarningsRepository
    private assetRepository: AssetRepository

    constructor(db: FirebaseFirestore.Firestore, eventPublisher?: IEventPublisher) {
        this.earnerRepository = new EarnerRepository(db)
        this.earningsRepository = new EarningsRepository(db)
        this.assetRepository = new AssetRepository(db)
    }

    async newEarner(payload: TNewEarner) {
        const earnerId = payload.symbol
        if (earnerId) {
            const earner = await this.earnerRepository.getEarner(earnerId)
            if (earner) {
                const msg = `Earner Creation Failed - earnerId: ${earnerId} already exists`
                throw new DuplicateError(msg, { earnerId })
            }
        }

        const earner = await this.createEarnerImpl(payload)
        return earner
    }

    async deleteEarner(earnerId: string) {
        await this.earnerRepository.deleteEarner(earnerId)
    }

    async scrubEarner(earnerId: string) {
        await this.earnerRepository.deleteEarner(earnerId)
    }

    async submitEarnings(earnerId: string, earning: TEarning) {
        const timeAtNow = DateTime.utc().toString()
        earning.earnedAt = timeAtNow
        const units = earning.units

        await this.earningsRepository.storeEarnerEarning(earnerId, earning)
        await this.earnerRepository.adjustCumulativeEarnings(earnerId, units)

        const earnerAssets = await this.assetRepository.listEarnerAssets(earnerId)
        const promises: any[] = []
        earnerAssets.forEach((assetId) => {
            promises.push(this.earningsRepository.storeAssetEarning(assetId, earning))
            promises.push(this.assetRepository.adjustCumulativeEarnings(assetId, units))
        })
        return Promise.all(promises)
    }

    ///////////////////////////////////////////
    // Private Methods
    ///////////////////////////////////////////

    private async createEarnerImpl(payload: TNewEarner) {
        const earner = Earner.newEarner(payload)
        await this.earnerRepository.storeEarner(earner)
        return earner
    }
}
