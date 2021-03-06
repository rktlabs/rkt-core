'use strict'
/* eslint-env node, mocha */

import { assert, expect } from 'chai'
import * as chai from 'chai'
import * as chaiSubset from 'chai-subset'
chai.use(chaiSubset)

import { PortfolioRepository, PortfolioFactory, Scrubber } from '../../../src'

describe('Portfolio Service', function () {
    this.timeout(30000)

    let portfolioRepository = new PortfolioRepository()
    let portfolioFactory: PortfolioFactory
    let portfolioId: string = 'aaa::test1'
    const scrubber = new Scrubber({ portfolioRepository })

    before(async () => {
        portfolioFactory = new PortfolioFactory(portfolioRepository)
    })

    beforeEach(async () => {
        await scrubber.scrubPortfolio(portfolioId)
    })

    after(async () => {
        await scrubber.scrubPortfolio(portfolioId)
    })

    describe('New Portfolio where none exists', () => {
        it('should create new portfolio1', async () => {
            const data = {
                type: 'aaa',
                ownerId: 'tester',
                portfolioId: portfolioId,
            }

            await portfolioFactory.createPortfolio(data)

            const readBack = await portfolioRepository.getDetailAsync(portfolioId)
            expect(readBack).to.exist
        })
    })

    describe('Create Portfolio where none exists', () => {
        it('should create new portfolio2', async () => {
            const data = {
                type: 'aaa',
                ownerId: 'tester',
                portfolioId: portfolioId,
            }

            await portfolioFactory.createPortfolio(data)

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

            await portfolioFactory.createPortfolio(data)

            await portfolioFactory
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

    describe.skip('Create Portfolio where already exists', () => {
        it('should create new portfolio3', async () => {
            const data = {
                type: 'aaa',
                ownerId: 'tester',
                portfolioId: portfolioId,
            }

            await portfolioFactory.createPortfolio(data)
            const readBack = await portfolioRepository.getDetailAsync(portfolioId)
            expect(readBack).to.exist

            await portfolioFactory.createPortfolio(data)

            const readBack2 = await portfolioRepository.getDetailAsync(portfolioId)
            expect(readBack2).to.exist
        })
    })
})
