'use strict'
/* eslint-env node, mocha */

import { assert, expect } from 'chai'
import * as chai from 'chai'
import * as chaiSubset from 'chai-subset'
chai.use(chaiSubset)

import { PortfolioRepository, PortfolioService, Publisher } from '../../src'

describe('Portfolio Service', function () {
    this.timeout(5000)

    let portfolioRepository: PortfolioRepository
    let portfolioService: PortfolioService
    let portfolioId: string = 'aaa::test1'

    before(async () => {
        const publisher = new Publisher()

        portfolioRepository = new PortfolioRepository()
        portfolioService = new PortfolioService()
    })

    beforeEach(async () => {
        await portfolioService.scrubPortfolio(portfolioId)
    })

    after(async () => {
        await portfolioService.scrubPortfolio(portfolioId)
    })

    describe('New Portfolio where none exists', () => {
        it('should create new portfolio', async () => {
            const data = {
                type: 'aaa',
                ownerId: 'tester',
                portfolioId: portfolioId,
            }

            await portfolioService.createPortfolio(data)

            const readBack = await portfolioRepository.getDetailAsync(portfolioId)
            expect(readBack).to.exist
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

            const readBack = await portfolioRepository.getDetailAsync(portfolioId)
            expect(readBack).to.exist
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
                .createPortfolio(data)
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
            const readBack = await portfolioRepository.getDetailAsync(portfolioId)
            expect(readBack).to.exist

            await portfolioService.createPortfolio(data)

            const readBack2 = await portfolioRepository.getDetailAsync(portfolioId)
            expect(readBack2).to.exist
        })
    })
})
