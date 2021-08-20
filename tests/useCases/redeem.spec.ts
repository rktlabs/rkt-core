'use strict'
/* eslint-env node, mocha */

import { expect } from 'chai'
import * as sinon from 'sinon'
import * as firebase from 'firebase-admin'

import {
    EventPublisher,
    PortfolioService,
    TransactionService,
    PortfolioAssetService,
    ContractService,
    EarnerService,
} from '../../src/services'
import { BootstrapService } from '../../src/services'

describe('Redeem asset ', function () {
    this.timeout(15000)

    let earnerService: EarnerService
    let portfolioService: PortfolioService
    let transactionService: TransactionService
    let portfolioAssetService: PortfolioAssetService
    let bootstrapService: BootstrapService
    let contractService: ContractService

    let eventPublisher: sinon.SinonStubbedInstance<EventPublisher>

    before(async () => {
        const db = firebase.firestore()
        eventPublisher = sinon.createStubInstance(EventPublisher)

        earnerService = new EarnerService(db, eventPublisher as any as EventPublisher)
        portfolioAssetService = new PortfolioAssetService(db, eventPublisher as any as EventPublisher)
        portfolioService = new PortfolioService(db, eventPublisher as any as EventPublisher)
        contractService = new ContractService(db, eventPublisher as any as EventPublisher)
        transactionService = new TransactionService(db, eventPublisher as any as EventPublisher)
        bootstrapService = new BootstrapService(db, eventPublisher as any as EventPublisher)
    })

    beforeEach(async () => {
        await bootstrapService.clearDb()
        await bootstrapService.bootstrap() // create mint, coin, and test contract

        // crete asset  card::jbone::test
        await bootstrapService.setupTestAsset()

        // setup new user portfolio: user:hedbot
        await portfolioService.createPortfolio({
            type: 'user',
            ownerId: 'tester',
            portfolioId: 'user::hedbot',
        })

        const contractCoins = 1000
        await transactionService.mintCoinsToPortfolio('contract::test', contractCoins)

        // move 10 units to the user
        const units = 10
        await contractService.mintContractAssetUnitsToPortfolio('user::hedbot', 'card::jbone::test', units)
    })

    describe('Redeem units of asset with no earnings.', () => {
        it('should pull assets with no change in coin', async () => {
            const userPortfolio = 'user::hedbot'
            const assetId = 'card::jbone::test'
            const units = 10

            //user protfolio has units
            const [assetUnitBalance, userUnitBalance, contractCoins, userCoins] = await Promise.all([
                contractService.getAssetUnitsIssued(assetId),
                portfolioAssetService.getPortfolioAssetBalance(userPortfolio, assetId),
                portfolioAssetService.getPortfolioAssetBalance('contract::test', 'coin::fantx'),
                portfolioAssetService.getPortfolioAssetBalance(userPortfolio, 'coin::fantx'),
            ])
            console.log(
                `init: asset units: ${assetUnitBalance}, portfolio units: ${userUnitBalance} contratCoins: ${contractCoins} userCoints: ${userCoins}`,
            )

            await contractService.redeemAsset('card::jbone::test')

            const [newAssetUnitBalance, newUserUnitBalance, newContractCoins, newUserCoins] = await Promise.all([
                contractService.getAssetUnitsIssued(assetId),
                portfolioAssetService.getPortfolioAssetBalance(userPortfolio, assetId),
                portfolioAssetService.getPortfolioAssetBalance('contract::test', 'coin::fantx'),
                portfolioAssetService.getPortfolioAssetBalance(userPortfolio, 'coin::fantx'),
            ])

            console.log(
                `after: asset units: ${newAssetUnitBalance}, portfolio units: ${newUserUnitBalance} contratCoins: ${newContractCoins} userCoints: ${newUserCoins}`,
            )
        })
    })

    describe('Redeem units of asset with accumulated earnings earnings.', () => {
        it('should move funds from contract to user portfolio', async () => {
            const userPortfolio = 'user::hedbot'
            const earnerId = 'card::jbone'
            const assetId = 'card::jbone::test'
            const units = 10

            await earnerService.submitEarnings(earnerId, { units, event: { description: 'test earnings1' } })
            await earnerService.submitEarnings(earnerId, { units, event: { description: 'test earnings2' } })

            const [assetUnitBalance, userUnitBalance, contractCoins, userCoins] = await Promise.all([
                contractService.getAssetUnitsIssued(assetId),
                portfolioAssetService.getPortfolioAssetBalance(userPortfolio, assetId),
                portfolioAssetService.getPortfolioAssetBalance('contract::test', 'coin::fantx'),
                portfolioAssetService.getPortfolioAssetBalance(userPortfolio, 'coin::fantx'),
            ])
            console.log(
                `init: asset units: ${assetUnitBalance}, portfolio units: ${userUnitBalance} contractCoins: ${contractCoins} userCoints: ${userCoins}`,
            )

            await contractService.redeemAsset('card::jbone::test')

            const [newAssetUnitBalance, newUserUnitBalance, newContractCoins, newUserCoins] = await Promise.all([
                contractService.getAssetUnitsIssued(assetId),
                portfolioAssetService.getPortfolioAssetBalance(userPortfolio, assetId),
                portfolioAssetService.getPortfolioAssetBalance('contract::test', 'coin::fantx'),
                portfolioAssetService.getPortfolioAssetBalance(userPortfolio, 'coin::fantx'),
            ])

            console.log(
                `after: asset units: ${newAssetUnitBalance}, portfolio units: ${newUserUnitBalance} contractCoins: ${newContractCoins} userCoints: ${newUserCoins}`,
            )
        })
    })
})
