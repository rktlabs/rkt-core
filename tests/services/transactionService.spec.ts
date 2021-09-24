'use strict'
/* eslint-env node, mocha */

import { expect } from 'chai'
import * as sinon from 'sinon'
import {
    TransactionRepository,
    PortfolioService,
    AssetService,
    TransactionService,
    AssetHolderService,
    NullNotificationPublisher,
    AssetRepository,
    PortfolioRepository,
    UserRepository,
    LeagueRepository,
    MarketMakerRepository,
} from '../../src'
import { BootstrapService } from '../../src/maint/bootstrapService'

describe('Transaction Service', function () {
    this.timeout(5000)

    let transactionRepository: TransactionRepository
    let bootstrapper: BootstrapService
    let portfolioRepository: PortfolioRepository
    let leagueRepository: LeagueRepository
    let marketMakerRepository: MarketMakerRepository
    let portfolioService: PortfolioService
    let assetHolderService: AssetHolderService
    let assetRepository: AssetRepository
    let assetService: AssetService
    let transactionService: TransactionService
    let userRepository: UserRepository

    let eventPublisher: sinon.SinonStubbedInstance<NullNotificationPublisher>

    before(async () => {
        eventPublisher = sinon.createStubInstance(NullNotificationPublisher)

        transactionRepository = new TransactionRepository()

        portfolioRepository = new PortfolioRepository()
        leagueRepository = new LeagueRepository()
        portfolioService = new PortfolioService(portfolioRepository)
        assetRepository = new AssetRepository()
        marketMakerRepository = new MarketMakerRepository()
        userRepository = new UserRepository()
        assetHolderService = new AssetHolderService(assetRepository)
        assetService = new AssetService(
            assetRepository,
            portfolioRepository,
            marketMakerRepository,
            transactionRepository,
        )
        transactionService = new TransactionService(
            assetRepository,
            portfolioRepository,
            transactionRepository,
            eventPublisher as any as NullNotificationPublisher,
        )
        bootstrapper = new BootstrapService(
            assetRepository,
            portfolioRepository,
            transactionRepository,
            userRepository,
            marketMakerRepository,
            leagueRepository,
        )

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
