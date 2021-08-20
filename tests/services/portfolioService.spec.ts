'use strict'
/* eslint-env node, mocha */

import { assert, expect } from 'chai'
import * as sinon from 'sinon'
import * as chai from 'chai'
import * as chaiSubset from 'chai-subset'
chai.use(chaiSubset)
import { Publisher, EventPublisher } from '../../src/services'

import * as firebase from 'firebase-admin'

import { PortfolioService } from '../../src/services'
import { PortfolioRepository } from '../../src/repositories'
import { PortfolioCache } from '../../src/caches'

describe('Portfolio Service', function () {
    this.timeout(5000)

    let portfolioRepository: PortfolioRepository
    let portfolioCache: PortfolioCache
    let portfolioService: PortfolioService
    let publisherStub: sinon.SinonStub
    let portfolioId: string = 'aaa::test1'

    before(async () => {
        const db = firebase.firestore()
        const publisher = new Publisher()
        const eventPublisher = new EventPublisher({ publisher: publisher })
        publisherStub = sinon.stub(publisher, 'publishMessageToTopicAsync')

        portfolioRepository = new PortfolioRepository(db)
        portfolioCache = new PortfolioCache(db)

        portfolioService = new PortfolioService(db, eventPublisher)
    })

    beforeEach(async () => {
        await portfolioService.scrubPortfolio(portfolioId)
        publisherStub.resetHistory()
    })

    after(async () => {
        await portfolioService.scrubPortfolio(portfolioId)
        publisherStub.restore()
    })

    describe('New Portfolio where none exists', () => {
        it('should create new portfolio', async () => {
            const data = {
                type: 'aaa',
                ownerId: 'tester',
                portfolioId: portfolioId,
            }

            await portfolioService.newPortfolio(data)

            const readBack = await portfolioRepository.getPortfolio(portfolioId)
            expect(readBack).to.exist

            const cacheBack = await portfolioCache.lookupPortfolio(portfolioId)
            expect(cacheBack).to.exist

            // should publish event
            // expect(publisherStub.callCount).to.eq(1)
            // expect(publisherStub.getCall(0).args[0]).to.eq('portfolioEvent') // topic

            // expect(publisherStub.getCall(0).args[1]).to.containSubset({
            //     eventType: 'PortfolioNew',
            //     //publishedAt: "2020-11-11T16:11:11.000Z",
            //     attributes: {
            //         portfolioId: portfolioId,
            //         portfolioType: 'aaa',
            //     },
            //     source: 'portfolioService',
            // })
        })
    })

    describe('Create Portfolio where none exists', () => {
        it('should create new portfolio', async () => {
            const data = {
                type: 'aaa',
                ownerId: 'tester',
                portfolioId: portfolioId,
            }

            await portfolioService.createPortfolio(data)

            const readBack = await portfolioRepository.getPortfolio(portfolioId)
            expect(readBack).to.exist

            const cacheBack = await portfolioCache.lookupPortfolio(portfolioId)
            expect(cacheBack).to.exist
        })
    })

    describe('New Portfolio where one exists', () => {
        it('should fail with exception', async () => {
            const data = {
                type: 'aaa',
                ownerId: 'tester',
                portfolioId: portfolioId,
            }

            await portfolioService.createPortfolio(data)

            await portfolioService
                .newPortfolio(data)
                .then(() => {
                    assert.fail('Function should not complete')
                })
                .catch((error: any) => {
                    expect(error).to.be.instanceOf(Error)
                    expect(error.message).to.eq('Portfolio Creation Failed - portfolioId: aaa::test1 already exists')
                })
        })
    })

    describe('Create Portfolio where already exists', () => {
        it('should create new portfolio', async () => {
            const data = {
                type: 'aaa',
                ownerId: 'tester',
                portfolioId: portfolioId,
            }

            await portfolioService.createPortfolio(data)
            const readBack = await portfolioRepository.getPortfolio(portfolioId)
            expect(readBack).to.exist

            // should only publish event on first
            // expect(publisherStub.callCount).to.eq(1)

            await portfolioService.createPortfolio(data)

            const readBack2 = await portfolioRepository.getPortfolio(portfolioId)
            expect(readBack2).to.exist

            // should only publish event on first
            // expect(publisherStub.callCount).to.eq(1)
        })
    })
})
