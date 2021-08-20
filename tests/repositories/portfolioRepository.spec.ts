'use strict'
/* eslint-env node, mocha */

import { expect } from 'chai'

import * as firebase from 'firebase-admin'

import { Portfolio } from '../../src/models'
import { PortfolioRepository } from '../../src/repositories'

describe('Portfolio Repository', () => {
    let portfolioRepository: PortfolioRepository
    const portfolioId = 'aaa::test1'

    before(async () => {
        const db = firebase.firestore()
        portfolioRepository = new PortfolioRepository(db)
    })

    afterEach(async () => {
        // clean out records.
        await portfolioRepository.deletePortfolio(portfolioId)
    })

    describe('Create Basic Portfolio', () => {
        it('should create', async () => {
            const data = {
                type: 'aaa',
                ownerId: 'tester',
                portfolioId: portfolioId,
            }
            const portfolio = Portfolio.newPortfolio(data)

            await portfolioRepository.storePortfolio(portfolio)

            const readBack = await portfolioRepository.getPortfolio(portfolioId)
            expect(readBack).to.exist
        })
    })

    describe('Create Full Portfolio', () => {
        it('should create', async () => {
            const data = {
                type: 'aaa',
                ownerId: 'tester',
                portfolioId: portfolioId,
                displayName: 'display-me',
                tags: {
                    tag1: 'thisistag1',
                    tag2: 'thisistag1',
                },
                xids: {
                    id1: 'xxx',
                    id2: 'yyy',
                },
            }

            const portfolio = Portfolio.newPortfolio(data)
            await portfolioRepository.storePortfolio(portfolio)

            const readBack = await portfolioRepository.getPortfolio(portfolioId)
            expect(readBack).to.exist
            if (readBack) {
                expect(readBack.type).to.eq('aaa')
                expect(readBack.ownerId).to.eq('tester')
                expect(readBack.portfolioId).to.eq(portfolioId)
                expect(readBack.displayName).to.eq('display-me')
                expect(readBack).to.have.property('tags')
                expect(readBack.tags).to.have.property('tag1')
                expect(readBack).to.have.property('xids')
                expect(readBack.xids).to.have.property('id1')
            }
        })
    })
})
