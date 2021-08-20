'use strict'
/* eslint-env node, mocha */

import { expect } from 'chai'

import * as firebase from 'firebase-admin'

import { BootstrapService, EventPublisher, MakerService, Publisher } from '../../src/services'
import { PortfolioRepository } from '../../src/repositories'
import { MakerRepository, TNewMaker } from 'makers'
import * as sinon from 'sinon'

describe('Maker Service', function () {
    this.timeout(5000)

    let makerService: MakerService
    let makerRepository: MakerRepository
    let portfolioRepository: PortfolioRepository
    let bootstrapper: BootstrapService
    let publisherStub: sinon.SinonStub
    let assetId: string = 'card::test1'

    before(async () => {
        const db = firebase.firestore()
        const publisher = new Publisher()
        const eventPublisher = new EventPublisher({ publisher: publisher })
        publisherStub = sinon.stub(publisher, 'publishMessageToTopicAsync')

        makerService = new MakerService(db, eventPublisher)
        makerRepository = new MakerRepository(db)
        portfolioRepository = new PortfolioRepository(db)

        bootstrapper = new BootstrapService(db, eventPublisher)

        await bootstrapper.clearDb()
        await bootstrapper.bootstrap()
    })

    beforeEach(async () => {
        await makerService.scrubMaker(assetId)
    })

    after(async () => {})

    describe('Create Basic Maker', () => {
        it('should create', async () => {
            const data: TNewMaker = {
                type: 'constantk',
                assetId: assetId,
                ownerId: 'tester',
                settings: {
                    initPrice: 10,
                },
            }

            await makerService.newMaker(data)

            const readBack = await makerRepository.getMaker(assetId)
            expect(readBack).to.exist
        })
    })

    describe('Create Basic Maker', () => {
        it('should create', async () => {
            const data: TNewMaker = {
                type: 'constantk',
                assetId: assetId,
                ownerId: 'tester',
                settings: {
                    initPrice: 10,
                },
            }

            await makerService.newMaker(data, true)

            const readBack = await makerRepository.getMaker(assetId)
            expect(readBack).to.exist

            const portfolio = await portfolioRepository.getPortfolio(`maker::${assetId}`)
            expect(portfolio).to.exist
        })
    })
})
