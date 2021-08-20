'use strict'
/* eslint-env node, mocha */

import { expect } from 'chai'
import * as sinon from 'sinon'
import { EventPublisher } from '../../src/services'

import * as firebase from 'firebase-admin'

import { EarnerService, BootstrapService } from '../../src/services'
import { EarnerRepository } from '../../src/repositories'
import { AssetRepository, AssetService, EarningsRepository, TNewAsset, TNewEarner } from '../../src'

describe('Earner Service', function () {
    this.timeout(5000)

    let assetService: AssetService
    let assetRepository: AssetRepository
    let earnerRepository: EarnerRepository
    let earningsRepository: EarningsRepository
    let earnerService: EarnerService
    let bootstrapper: BootstrapService
    let eventPublisher: sinon.SinonStubbedInstance<EventPublisher>
    let earnerId: string = 'card::test1'

    before(async () => {
        const db = firebase.firestore()
        eventPublisher = sinon.createStubInstance(EventPublisher)

        assetRepository = new AssetRepository(db)
        earnerRepository = new EarnerRepository(db)
        earningsRepository = new EarningsRepository(db)
        earnerService = new EarnerService(db, eventPublisher as any as EventPublisher)
        assetService = new AssetService(db, eventPublisher as any as EventPublisher)

        bootstrapper = new BootstrapService(db, eventPublisher as any as EventPublisher)
        await bootstrapper.clearDb()
    })

    beforeEach(async () => {
        await earnerService.scrubEarner(earnerId)
    })

    describe('Pay Earner Earning (no assets)', () => {
        it('should pay earning', async () => {
            const data: TNewEarner = {
                ownerId: 'tester',
                symbol: earnerId,
            }
            await earnerService.newEarner(data)

            const units = 11

            await earnerService.submitEarnings(earnerId, { units, event: { description: 'test earnings' } })
            await earnerService.submitEarnings(earnerId, { units, event: { description: 'test earnings' } })

            const earnings = await earningsRepository.listEarnerEarnings(earnerId)
            expect(earnings.length).to.eq(2)

            const earner = await earnerRepository.getEarner(earnerId)
            expect(earner!!.cumulativeEarnings).to.eq(units * 2)
        })
    })

    describe('Pay Earner Earning (with assets)', () => {
        it('should pay earning', async () => {
            const data: TNewEarner = {
                ownerId: 'tester',
                symbol: earnerId,
            }
            await earnerService.newEarner(data)

            const contractId = 'theContractId'
            const assetId = `${earnerId}::${contractId}`
            const assetDef: TNewAsset = {
                ownerId: 'tester',
                symbol: assetId,
                contractId: contractId,
                earnerId: earnerId,
            }
            await assetService.newAsset(assetDef)

            const units = 11

            await earnerService.submitEarnings(earnerId, { units, event: { description: 'test earnings' } })
            await earnerService.submitEarnings(earnerId, { units, event: { description: 'test earnings' } })

            const earnings = await earningsRepository.listAssetEarnings(assetId)
            expect(earnings.length).to.eq(2)

            const asset = await assetRepository.getAsset(assetId)
            expect(asset!!.cumulativeEarnings).to.eq(units * 2)
        })
    })
})
