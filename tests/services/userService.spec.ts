'use strict'
/* eslint-env node, mocha */

import { assert, expect } from 'chai'
import * as sinon from 'sinon'
import { EventPublisher } from '../../src/services'

import * as firebase from 'firebase-admin'

import { UserService, BootstrapService, PortfolioAssetService } from '../../src/services'
import { UserRepository, PortfolioRepository } from '../../src/repositories'
import { InsufficientBalance, TNewUser } from '../../src'

describe('User Service', function () {
    this.timeout(5000)

    let userRepository: UserRepository
    let portfolioRepository: PortfolioRepository
    let userService: UserService
    let eventPublisher: sinon.SinonStubbedInstance<EventPublisher>
    let db: any

    const userTemplate = {
        dob: '1/2/2021',
        email: 'bjcleaver@cleaver.com',
        name: 'Boris Cleaver',
        username: 'bjcleaver',
    }

    before(async () => {
        db = firebase.firestore()
        eventPublisher = sinon.createStubInstance(EventPublisher)
        userRepository = new UserRepository(db)
        portfolioRepository = new PortfolioRepository(db)
        userService = new UserService(db, eventPublisher as any as EventPublisher)
    })

    describe('User Service Simple', () => {
        let userId: string

        afterEach(async () => {
            await userService.deleteUser(userId)
        })

        describe('Create Basic User - with portfolio', () => {
            it('should create', async () => {
                const user = await userService.newUser(userTemplate)
                userId = user.userId

                const readBack = await userRepository.getUser(user.userId)
                expect(readBack).to.exist

                const portfolioId = readBack!!.portfolioId
                expect(portfolioId).to.exist

                const portfolio = await portfolioRepository.getPortfolio(portfolioId!!)
                expect(portfolio).to.exist
            })
        })

        describe('Create Basic User - with userId supplied', () => {
            it('should create', async () => {
                const userTemplate2 = {
                    userId: '12345',
                    dob: '1/2/2021',
                    email: 'bjcleaver@cleaver.com',
                    name: 'Boris Cleaver',
                    username: 'bjcleaver',
                }

                const user = await userService.newUser(userTemplate2)
                userId = user.userId
                expect(userId).to.eq('12345')

                const readBack = await userRepository.getUser(user.userId)
                expect(readBack).to.exist

                const portfolioId = readBack!!.portfolioId
                expect(portfolioId).to.exist

                const portfolio = await portfolioRepository.getPortfolio(portfolioId!!)
                expect(portfolio).to.exist
            })
        })

        describe('Create User where username already exists', () => {
            it('should fail with exception', async () => {
                const user = await userService.newUser({
                    dob: '1/2/2021',
                    email: 'bjcleaver@cleaver.com',
                    name: 'Boris Cleaver',
                    username: 'bjcleaver',
                })
                userId = user.userId

                const data2: TNewUser = {
                    dob: '1/3/2021',
                    email: 'jcleave@cleaver.com',
                    name: 'Janice Cleaver',
                    username: 'bjcleaver',
                }

                await userService
                    .newUser(data2)
                    .then(() => {
                        assert.fail('Function should not complete')
                    })
                    .catch((error: any) => {
                        expect(error).to.be.instanceOf(Error)
                        expect(error.message).to.eq('User Creation Failed - username: bjcleaver already exists')
                    })
            })
        })

        describe('Create User where email already exists', () => {
            it('should fail with exception', async () => {
                const user = await userService.newUser(userTemplate)
                userId = user.userId

                const data2: TNewUser = {
                    dob: '1/3/2021',
                    email: 'bjcleaver@cleaver.com',
                    name: 'Janice Cleaver',
                    username: 'jjcleaver',
                }

                await userService
                    .newUser(data2)
                    .then(() => {
                        assert.fail('Function should not complete')
                    })
                    .catch((error: any) => {
                        expect(error).to.be.instanceOf(Error)
                        expect(error.message).to.eq(
                            'User Creation Failed - email: bjcleaver@cleaver.com already exists',
                        )
                    })
            })
        })
    })

    describe('User Service Boot', () => {
        let bootstrapper: BootstrapService
        let portfolioAssetService: PortfolioAssetService

        let userId: string

        before(async () => {
            portfolioAssetService = new PortfolioAssetService(db, eventPublisher as any as EventPublisher)
            bootstrapper = new BootstrapService(db, eventPublisher as any as EventPublisher)
        })

        beforeEach(async () => {
            //await userService.deleteUser(userId)
            await bootstrapper.clearDb()
            await bootstrapper.bootstrap()
            await bootstrapper.setupTreasury()
        })

        afterEach(async () => {
            //await userService.deleteUser(userId)
        })

        describe('Create User with Initial Coins', () => {
            it('should deposit', async () => {
                const depositUnits = 100
                const newTemplate = Object.assign({}, userTemplate, { initialCoins: depositUnits })
                const user = await userService.newUser(newTemplate)

                // verify that user has coins
                const portfolioId = user.portfolioId!!
                const madeUnits = await portfolioAssetService.getPortfolioAssetBalance(portfolioId, 'coin::fantx')

                expect(madeUnits).to.eq(depositUnits, 'verify units deposited')
            })
        })

        describe('Deposit Coin with User', () => {
            it('should deposit', async () => {
                const user = await userService.newUser(userTemplate)
                userId = user.id

                const treasuryUnits = await portfolioAssetService.getPortfolioAssetBalance(
                    'bank::treasury',
                    'coin::fantx',
                )

                const depositUnits = 100

                await userService.depositCoins(user.userId, depositUnits)

                // verify that user has coins
                const portfolioId = user.portfolioId!!
                const madeUnits = await portfolioAssetService.getPortfolioAssetBalance(portfolioId, 'coin::fantx')
                const remainingTreasuryUnits = await portfolioAssetService.getPortfolioAssetBalance(
                    'bank::treasury',
                    'coin::fantx',
                )

                expect(madeUnits).to.eq(depositUnits, 'verify units deposited')
                expect(treasuryUnits - remainingTreasuryUnits).to.eq(depositUnits, 'verify adjusted treasury units')
            })
        })

        describe("Withdraw Coin from User that user doesn't have", () => {
            it('should deposit', async () => {
                const user = await userService.newUser(userTemplate)
                userId = user.id

                const withdrawUnits = 100

                await userService
                    .withdrawCoins(user.userId, withdrawUnits)
                    .then(() => {
                        assert.fail('Function should not complete')
                    })
                    .catch((error: any) => {
                        expect(error).to.be.instanceOf(InsufficientBalance)
                        expect(error.message).to.eq(
                            `No input holding - input: 1 portfolio: ${user.portfolioId} holding: coin::fantx`,
                        )
                    })
            })
        })

        describe("Withdraw Coin from User that user doesn't have", () => {
            it('should deposit', async () => {
                const user = await userService.newUser(userTemplate)
                userId = user.id

                // put some units in portfolio before withdraw
                const portfolioUnits = 1000
                await userService.depositCoins(user.userId, portfolioUnits)

                const treasuryUnits = await portfolioAssetService.getPortfolioAssetBalance(
                    'bank::treasury',
                    'coin::fantx',
                )

                const withdrawUnits = 100
                await userService.withdrawCoins(user.userId, withdrawUnits)

                // verify that user has coins
                const portfolioId = user.portfolioId!!
                const madeUnits = await portfolioAssetService.getPortfolioAssetBalance(portfolioId, 'coin::fantx')
                const remainingTreasuryUnits = await portfolioAssetService.getPortfolioAssetBalance(
                    'bank::treasury',
                    'coin::fantx',
                )

                expect(portfolioUnits - madeUnits).to.eq(withdrawUnits, 'verify units withdrawn')
                expect(remainingTreasuryUnits - treasuryUnits).to.eq(withdrawUnits, 'verify adjusted treasury units')
            })
        })
    })
})