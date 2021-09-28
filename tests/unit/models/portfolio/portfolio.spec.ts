'use strict'
/* eslint-env node, mocha */
import { expect } from 'chai'

import { Portfolio } from '../../../../src/models'

describe('Portfolio', () => {
    const portfolioId = 'aaa::test1'

    describe('Create New Portfolio', () => {
        it('no displayname should default to portfolioId', async () => {
            const data = {
                type: 'aaa',
                ownerId: 'tester',
                portfolioId: portfolioId,
            }

            const portfolio = Portfolio.newPortfolio(data)
            expect(portfolio.displayName).to.eq(portfolioId)
        })

        it('use displayName if supplied', async () => {
            const displayName = 'thisisme'

            const data = {
                type: 'aaa',
                ownerId: 'tester',
                portfolioId: portfolioId,
                displayName: displayName,
            }

            const portfolio = Portfolio.newPortfolio(data)
            expect(portfolio.displayName).to.eq(displayName)
        })

        it('generate typed portfolioId if portfolioId not supplied', async () => {
            const data = {
                type: 'aaa',
                ownerId: 'tester',
            }

            const portfolio = Portfolio.newPortfolio(data)
            expect(portfolio.portfolioId).is.not.null

            const type = portfolio.portfolioId.split(':')[0]
            expect(type).is.eq('aaa')
        })
    })
})
