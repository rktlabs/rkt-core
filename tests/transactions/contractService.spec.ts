'use strict'
/* eslint-env node, mocha */

import { expect } from 'chai'
import { DateTime } from 'luxon'

import * as firebase from 'firebase-admin'
import * as sinon from 'sinon'

import { ContractService, EventPublisher, BootstrapService, PortfolioAssetService } from '../../src/services'

describe('Contract Transactions', function () {
    this.timeout(5000)

    let portfolioAssetService: PortfolioAssetService
    let contractService: ContractService
    let boostrapService: BootstrapService
    let eventPublisher: sinon.SinonStubbedInstance<EventPublisher>
    let contractId: string

    before(async () => {
        const db = firebase.firestore()
        eventPublisher = sinon.createStubInstance(EventPublisher)

        contractId = 'testcontract1'

        portfolioAssetService = new PortfolioAssetService(db, eventPublisher as any as EventPublisher)
        contractService = new ContractService(db, eventPublisher as any as EventPublisher)
        boostrapService = new BootstrapService(db, eventPublisher as any as EventPublisher)
        await boostrapService.clearDb()
    })

    beforeEach(async () => {
        sinon.resetHistory()
    })

    describe('Fund Contract', () => {
        beforeEach(async () => {
            await boostrapService.bootMint()

            await contractService.scrubContract(contractId)

            await contractService.newContract({
                ownerId: 'tester',
                contractId: contractId,
                startAt: DateTime.local(2020, 8, 15).toString(),
                endAt: DateTime.local(2020, 12, 31).toString(),
                key: 'seasons',
                pt: 1,
            })
        })

        it('should move funds from mint to contract', async () => {
            await contractService.fundContractAsync(contractId, 20)

            // verify that dest has balance of 10
            let portfolioId: string = `contract::${contractId}`
            expect(await portfolioAssetService.getPortfolioAssetBalance(portfolioId, 'coin::fantx')).to.eq(20)

            // verify that sr has balance of 10
            let sorucePortfolioId: string = `contract::mint`
            expect(await portfolioAssetService.getPortfolioAssetBalance(sorucePortfolioId, 'coin::fantx')).to.eq(-20)
        })
    })
})
