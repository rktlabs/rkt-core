'use strict'
/* eslint-env node, mocha */
import { expect } from 'chai'

import { User, TNewUserConfig } from '../../../src/models'

describe('User', () => {
    it('new user should have no portfolioId', async () => {
        const data: TNewUserConfig = {
            userId: '11111',
            dob: '1/2/2021',
            email: 'bjcleaver@cleaver.com',
            name: 'Boris Cleaver',
            username: 'bjcleaver',
        }

        const user = User.newUser(data)
        expect(user.portfolioId).to.not.exist
        expect(user.userId).to.eq('11111')
    })

    describe('Create New User', () => {
        it('new user should have no portfolioId', async () => {
            const data: TNewUserConfig = {
                dob: '1/2/2021',
                email: 'bjcleaver@cleaver.com',
                name: 'Boris Cleaver',
                username: 'bjcleaver',
            }

            const user = User.newUser(data)
            expect(user.portfolioId).to.not.exist
        })

        it('no displayname should default to userId', async () => {
            const data: TNewUserConfig = {
                dob: '1/2/2021',
                email: 'bjcleaver@cleaver.com',
                name: 'Boris Cleaver',
                username: 'bjcleaver',
            }

            const user = User.newUser(data)
            expect(user.displayName).to.eq('Boris Cleaver')
            expect(user.portfolioId).to.not.exist
        })

        it('use displayName if supplied', async () => {
            const data: TNewUserConfig = {
                dob: '1/2/2021',
                email: 'bjcleaver@cleaver.com',
                name: 'Boris Cleaver',
                username: 'bjcleaver',
                displayName: 'other',
            }

            const user = User.newUser(data)
            expect(user.displayName).to.eq('other')
        })
    })
})
