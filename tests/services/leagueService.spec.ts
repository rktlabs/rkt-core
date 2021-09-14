'use strict'
/* eslint-env node, mocha */

import { expect } from 'chai'
import { DateTime } from 'luxon'

import * as sinon from 'sinon'
import {
    LeagueRepository,
    AssetRepository,
    PortfolioRepository,
    LeagueService,
    EventPublisher,
    PortfolioHoldingsService,
} from '../../src'
import { BootstrapService } from '../../src/maint/bootstrapService'

describe('League Service', function () {
    this.timeout(5000)

    let leagueRepository: LeagueRepository
    let assetRepository: AssetRepository
    let profileRepository: PortfolioRepository

    let portfolioHoldingsService: PortfolioHoldingsService
    let leagueService: LeagueService
    let boostrapService: BootstrapService

    let leagueId: string = 'testleague1'

    let eventPublisher: sinon.SinonStubbedInstance<EventPublisher>

    before(async () => {
        eventPublisher = sinon.createStubInstance(EventPublisher)

        leagueRepository = new LeagueRepository()
        profileRepository = new PortfolioRepository()
        assetRepository = new AssetRepository()

        portfolioHoldingsService = new PortfolioHoldingsService()
        leagueService = new LeagueService()
        boostrapService = new BootstrapService(eventPublisher as any as EventPublisher)
    })

    beforeEach(async () => {
        //await boostrapService.clearDb()
        sinon.resetHistory()
    })

    describe('Create Basic League', () => {
        beforeEach(async () => {
            await leagueService.scrubLeague(leagueId)
        })

        it('should create', async () => {
            const data = {
                ownerId: 'tester',
                leagueId: leagueId,
                portfolioId: `league::${leagueId}`,
                startAt: DateTime.local(2020, 8, 15).toString(),
                endAt: DateTime.local(2020, 12, 31).toString(),
                key: 'seasons',
                pt: 1,
            }

            await leagueService.newLeague(data)

            const league = await leagueRepository.getDetailAsync(leagueId)
            expect(league).to.exist
            expect(league!!.leagueId).to.be.eq(leagueId)

            const portfolioId = `league::${leagueId}`
            expect(league!!.portfolioId).to.be.eq(portfolioId)

            const profile = await profileRepository.getDetailAsync(portfolioId)
            expect(profile).to.exist
            expect(profile!!.portfolioId).to.be.eq(portfolioId)
        })
    })

    describe.only('Delete Empty League', () => {
        beforeEach(async () => {
            await leagueService.scrubLeague(leagueId)
        })

        it('should create', async () => {
            const data = {
                ownerId: 'tester',
                leagueId: leagueId,
                portfolioId: `league::${leagueId}`,
                startAt: DateTime.local(2020, 8, 15).toString(),
                endAt: DateTime.local(2020, 12, 31).toString(),
                key: 'seasons',
                pt: 1,
            }

            const league = await leagueService.newLeague(data)
            await leagueService.deleteLeague(league.leagueId)

            const readBack = await leagueRepository.getDetailAsync(leagueId)

            expect(readBack).to.not.exist
        })
    })

    // describe('Create Assets', () => {
    //     let leagueId: string = 'testleague1'
    //     let assetList: TLeagueEarnerDef[] = [
    //         { earnerId: 'card::aaa', initialPrice: 10, displayName: 'helloa' },
    //         { earnerId: 'card::bbb', initialPrice: 20, displayName: 'hellob' },
    //         { earnerId: 'card::ccc', initialPrice: 30, displayName: 'helloc' },
    //         { earnerId: 'card::ddd', initialPrice: 40, displayName: 'hellod' },
    //     ]

    //     beforeEach(async () => {
    //         await leagueService.scrubLeague(leagueId)

    //         await leagueService.newLeague({
    //             ownerId: 'tester',
    //             leagueId: leagueId,

    //             // earnerList: assetList,
    //         })
    //     })

    //     it('should create asset list', async () => {
    //         await leagueService.setupLeagueEarnerList(leagueId, assetList)

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
    //         await leagueService.mintLeagueAssetUnitsToPortfolio('user::hedbot', 'card::jbone::test', 10)

    //         // verify that treasury has balance of 10
    //         expect(await portfolioHoldingsService.getPortfolioHoldingsBalance('user::hedbot', 'card::jbone::test')).to.eq(10)

    //         // verify that mint has balance of -10
    //         expect(await portfolioHoldingsService.getPortfolioHoldingsBalance('league::test', 'card::jbone::test')).to.eq(
    //             -10,
    //         )

    //         //expect(eventPublisher.publishTransactionEventUpdatePortfolioAsync.callCount).to.eq(2)
    //         expect(eventPublisher.publishTransactionEventCompleteAsync.callCount).to.eq(1)
    //         expect(eventPublisher.publishTransactionEventErrorAsync.callCount).to.eq(0)
    //     })
    // })
})
