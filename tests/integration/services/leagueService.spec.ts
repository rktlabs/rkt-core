'use strict'
/* eslint-env node, mocha */

import { expect } from 'chai'
import {
    AssetHolderService,
    AssetRepository,
    LeagueRepository,
    LeagueFactory,
    MarketMakerRepository,
    PortfolioRepository,
    TransactionRepository,
    UserRepository,
    BootstrapService,
    Scrubber,
} from '../../../src'

describe('League Service', function () {
    this.timeout(30000)

    let leagueRepository = new LeagueRepository()
    let assetRepository = new AssetRepository()
    let marketMakerRepository = new MarketMakerRepository()
    let portfolioRepository = new PortfolioRepository()
    let transactionRepository = new TransactionRepository()
    let userRepository = new UserRepository()

    let assetHolderService: AssetHolderService
    let leagueFactory: LeagueFactory
    let boostrapService: BootstrapService
    const scrubber = new Scrubber({ assetRepository, portfolioRepository, userRepository })

    let leagueId: string = 'testleague1'

    before(async () => {
        assetHolderService = new AssetHolderService(assetRepository)
        leagueFactory = new LeagueFactory(leagueRepository, assetRepository, portfolioRepository)
        boostrapService = new BootstrapService(
            assetRepository,
            portfolioRepository,
            transactionRepository,
            userRepository,
            marketMakerRepository,
            leagueRepository,
        )
    })

    describe('Create Basic League', () => {
        beforeEach(async () => {
            await scrubber.scrubLeague(leagueId)
        })

        it('should create', async () => {
            const data = {
                ownerId: 'tester',
                leagueId: leagueId,
                portfolioId: `league::${leagueId}`,
            }

            await leagueFactory.createLeague(data)

            const league = await leagueRepository.getDetailAsync(leagueId)
            expect(league).to.exist
            expect(league!!.leagueId).to.be.eq(leagueId)

            const portfolioId = `league::${leagueId}`
            expect(league!!.portfolioId).to.be.eq(portfolioId)

            const profile = await portfolioRepository.getDetailAsync(portfolioId)
            expect(profile).to.exist
            expect(profile!!.portfolioId).to.be.eq(portfolioId)
        })
    })

    describe('Delete Empty League', () => {
        beforeEach(async () => {
            await scrubber.scrubLeague(leagueId)
        })

        it('should create', async () => {
            const data = {
                ownerId: 'tester',
                leagueId: leagueId,
                portfolioId: `league::${leagueId}`,
            }

            const league = await leagueFactory.createLeague(data)
            await leagueFactory.deleteLeague(league.leagueId)

            const readBack = await leagueRepository.getDetailAsync(leagueId)

            expect(readBack).to.not.exist
        })
    })

    // describe('Create Assets', () => {
    //     let leagueId: string = 'testleague1'
    //     let assetList: TLeagueEarnerDef[] = [
    //         { earnerId: 'card::aaa', displayName: 'helloa' },
    //         { earnerId: 'card::bbb', displayName: 'hellob' },
    //         { earnerId: 'card::ccc', displayName: 'helloc' },
    //         { earnerId: 'card::ddd', displayName: 'hellod' },
    //     ]

    //     beforeEach(async () => {
    //         await leagueFactory.scrubLeague(leagueId)

    //         await leagueFactory.newLeague({
    //             ownerId: 'tester',
    //             leagueId: leagueId,

    //             // earnerList: assetList,
    //         })
    //     })

    //     it('should create asset list', async () => {
    //         await leagueFactory.setupLeagueEarnerList(leagueId, assetList)

    //         const [asset1, asset2, asset3, asset4] = await Promise.all([
    //             assetRepository.getDetailAsync('card::aaa::testleague1'),
    //             assetRepository.getDetailAsync('card::bbb::testleague1'),
    //             assetRepository.getDetailAsync('card::ccc::testleague1'),
    //             assetRepository.getDetailAsync('card::ddd::testleague1'),
    //         ])
    //         expect(asset1).to.exist
    //         expect(asset2).to.exist
    //         expect(asset3).to.exist
    //         expect(asset4).to.exist
    //     })
    // })

    // describe('Mint Asset Units to portfolio', () => {
    //     it('should move asset units from asset league to portfolio', async () => {
    //         await boostrapService.fullBoot()
    //         await leagueFactory.mintLeagueAssetUnitsToPortfolio('user::hedbot', 'card::jbone::test', 10)

    //         // verify that treasury has balance of 10
    //         expect(await portfolioHoldingService.getPortfolioHoldingsBalance('user::hedbot', 'card::jbone::test')).to.eq(10)

    //         // verify that mint has balance of -10
    //         expect(await portfolioHoldingService.getPortfolioHoldingsBalance('league::test', 'card::jbone::test')).to.eq(
    //             -10,
    //         )

    //         //expect(eventPublisher.publishTransactionEventUpdatePortfolioAsync.callCount).to.eq(2)
    //         expect(eventPublisher.publishTransactionEventCompleteAsync.callCount).to.eq(1)
    //         expect(eventPublisher.publishTransactionEventErrorAsync.callCount).to.eq(0)
    //     })
    // })
})
