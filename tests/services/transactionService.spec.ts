'use strict'
/* eslint-env node, mocha */

import { expect } from 'chai'
import * as sinon from 'sinon'
import {
    TransactionRepository,
    PortfolioService,
    AssetService,
    TransactionService,
    PortfolioHoldingService,
    QueueEventPublisher,
} from '../../src'
import { BootstrapService } from '../../src/maint/bootstrapService'

describe('Transaction Service', function () {
    this.timeout(5000)

    let transactionRepository: TransactionRepository
    let bootstrapper: BootstrapService
    let portfolioService: PortfolioService
    let portfolioHoldingService: PortfolioHoldingService
    let assetService: AssetService
    let transactionService: TransactionService

    let eventPublisher: sinon.SinonStubbedInstance<QueueEventPublisher>

    before(async () => {
        eventPublisher = sinon.createStubInstance(QueueEventPublisher)

        transactionRepository = new TransactionRepository()

        portfolioService = new PortfolioService()
        portfolioHoldingService = new PortfolioHoldingService()
        assetService = new AssetService()
        transactionService = new TransactionService(eventPublisher as any as QueueEventPublisher)
        bootstrapper = new BootstrapService()

        //await bootstrapper.clearDb()
        await bootstrapper.fullBoot()
    })

    beforeEach(async () => {
        sinon.resetHistory()
    })

    afterEach(async () => {})

    after(async () => {
        //await bootstrapper.scrub(),
    })

    // describe('Fund Portfolio', () => {
    //     it('should move funds from mint league to user portfolio', async () => {
    //         await transactionService.mintCoinsToPortfolio('user::hedbot', 10)

    //         // verify that treasury has balance of 10
    //         expect(await portfolioHoldingService.getPortfolioHoldingsBalance('user::hedbot', 'coin::fantx')).to.eq(10)

    //         // verify that mint has balance of -10
    //         expect(await portfolioHoldingService.getPortfolioHoldingsBalance('league::mynt', 'coin::fantx')).to.eq(-10)

    //         //expect(eventPublisher.publishTransactionEventUpdatePortfolioAsync.callCount).to.eq(2)
    //         expect(eventPublisher.publishTransactionEventCompleteAsync.callCount).to.eq(1)
    //         expect(eventPublisher.publishTransactionEventErrorAsync.callCount).to.eq(0)
    //     })
    // })

    // describe('Mint Non-existent Asset Units to portfolio', () => {
    //     it('should create', async () => {
    //         await transactionService
    //             .mintUnitsToPortfolio('user::hedbot', 'card::xxx', 10)
    //             .then(() => {
    //                 assert.fail('Function should not complete')
    //             })
    //             .catch((error: any) => {
    //                 expect(error).to.be.instanceOf(Error)
    //                 expect(error.message).to.eq('Cannot mint asset: card::xxx does not exist')
    //             })
    //     })
    // })

    // describe('Mint Asset Units to Non-existent portfolio', () => {
    //     it('should create', async () => {
    //         await transactionService
    //             .mintUnitsToPortfolio('user::xxx', 'card::jbone::test', 10)
    //             .then(() => {
    //                 assert.fail('Function should not complete')
    //             })
    //             .catch((error: any) => {
    //                 expect(error).to.be.instanceOf(Error)
    //                 expect(error.message).to.eq('Cannot mint to portfolio: user::xxx does not exist')
    //             })
    //     })
    // })
})
