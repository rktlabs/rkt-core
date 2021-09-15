'use strict'
/* eslint-env node, mocha */

import { expect } from 'chai'
import * as sinon from 'sinon'
import { MakerService, MakerRepository, PortfolioRepository, Publisher, EventPublisher } from '../../src'
import { BootstrapService } from '../../src/maint/bootstrapService'
import { TNewMakerConfig } from '../../src/services/makerService/makers/makerBase/types'

describe('Maker Service', function () {
    this.timeout(5000)

    let makerService: MakerService
    let makerRepository: MakerRepository
    let portfolioRepository: PortfolioRepository
    let bootstrapper: BootstrapService
    let publisherStub: sinon.SinonStub
    let assetId: string = 'card::test1'

    before(async () => {
        const publisher = new Publisher()
        const eventPublisher = new EventPublisher({ publisher: publisher })
        publisherStub = sinon.stub(publisher, 'publishMessageToTopicAsync')

        makerService = new MakerService()
        makerRepository = new MakerRepository()
        portfolioRepository = new PortfolioRepository()

        bootstrapper = new BootstrapService(eventPublisher)

        //await bootstrapper.clearDb()
        await bootstrapper.bootstrap()
    })

    beforeEach(async () => {
        await makerService.scrubMaker(assetId)
    })

    after(async () => {})

    describe('Create Basic Maker', () => {
        it('should create', async () => {
            const data: TNewMakerConfig = {
                type: 'constantk',
                assetId: assetId,
                ownerId: 'tester',
                settings: {
                    initPrice: 10,
                },
            }

            await makerService.createMaker(data)

            const readBack = await makerRepository.getDetailAsync(assetId)
            expect(readBack).to.exist
        })
    })

    describe('Create Basic Maker', () => {
        it('should create', async () => {
            const data: TNewMakerConfig = {
                type: 'constantk',
                assetId: assetId,
                ownerId: 'tester',
                settings: {
                    initPrice: 10,
                },
            }

            await makerService.createMaker(data, true)

            const readBack = await makerRepository.getDetailAsync(assetId)
            expect(readBack).to.exist

            const portfolio = await portfolioRepository.getDetailAsync(`maker::${assetId}`)
            expect(portfolio).to.exist
        })
    })
})
