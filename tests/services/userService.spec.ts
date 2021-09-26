'use strict'
/* eslint-env node, mocha */

import { assert, expect } from 'chai'
import {
    UserRepository,
    PortfolioRepository,
    UserFactory,
    AssetHolderService,
    TNewUserConfig,
    AssetRepository,
    TransactionRepository,
    LeagueRepository,
    MarketMakerRepository,
} from '../../src'
import { BootstrapService } from '../../src/maint/bootstrapService'

describe.skip('User Service', function () {
    this.timeout(5000)

    let userRepository: UserRepository
    let portfolioRepository: PortfolioRepository
    let userService: UserFactory

    const userTemplate = {
        dob: '1/2/2021',
        email: 'bjcleavertest@cleaver.com',
        name: 'Boris Cleaver',
        username: 'bjcleavertest',
    }

    before(async () => {
        userRepository = new UserRepository()
        portfolioRepository = new PortfolioRepository()
        userService = new UserFactory(portfolioRepository, userRepository)
    })

    describe('User Service Simple', () => {
        let userId: string

        afterEach(async () => {
            await userService.deleteUser(userId)
        })

        describe('Create Basic User - with portfolio', () => {
            it('should create', async () => {
                const user = await userService.createUser(userTemplate)
                userId = user.userId

                const readBack = await userRepository.getDetailAsync(user.userId)
                expect(readBack).to.exist

                const portfolioId = readBack!!.portfolioId
                expect(portfolioId).to.exist

                const portfolio = await portfolioRepository.getDetailAsync(portfolioId!!)
                expect(portfolio).to.exist
            })
        })

        describe('Create Basic User - with userId supplied', () => {
            it('should create', async () => {
                const userTemplate2 = {
                    userId: '12345',
                    dob: '1/2/2021',
                    email: 'bjcleavertest@cleaver.com',
                    name: 'Boris Cleaver',
                    username: 'bjcleavertest',
                }

                const user = await userService.createUser(userTemplate2)
                userId = user.userId
                expect(userId).to.eq('12345')

                const readBack = await userRepository.getDetailAsync(user.userId)
                expect(readBack).to.exist

                const portfolioId = readBack!!.portfolioId
                expect(portfolioId).to.exist

                const portfolio = await portfolioRepository.getDetailAsync(portfolioId!!)
                expect(portfolio).to.exist
            })
        })

        describe('Create User where username already exists', () => {
            it('should fail with exception', async () => {
                const user = await userService.createUser({
                    dob: '1/2/2021',
                    email: 'bjcleavertest@cleaver.com',
                    name: 'Boris Cleaver',
                    username: 'bjcleavertest',
                })
                userId = user.userId

                const data2: TNewUserConfig = {
                    dob: '1/3/2021',
                    email: 'jcleave@cleaver.com',
                    name: 'Janice Cleaver',
                    username: 'bjcleaver',
                }

                await userService
                    .createUser(data2)
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
                const user = await userService.createUser(userTemplate)
                userId = user.userId

                const data2: TNewUserConfig = {
                    dob: '1/3/2021',
                    email: 'bjcleavertest@cleaver.com',
                    name: 'Janice Cleaver',
                    username: 'jjcleaver',
                }

                await userService
                    .createUser(data2)
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
        let assetRepository: AssetRepository
        let assetHolderService: AssetHolderService
        let transactionRepository: TransactionRepository
        let userRepository: UserRepository
        let marketMakerRepository: MarketMakerRepository
        let leagueRepository: LeagueRepository

        before(async () => {
            assetRepository = new AssetRepository()
            userRepository = new UserRepository()
            transactionRepository = new TransactionRepository()
            marketMakerRepository = new MarketMakerRepository()
            leagueRepository = new LeagueRepository()
            assetHolderService = new AssetHolderService(assetRepository)
            bootstrapper = new BootstrapService(
                assetRepository,
                portfolioRepository,
                transactionRepository,
                userRepository,
                marketMakerRepository,
                leagueRepository,
            )
            await bootstrapper.bootstrap()
        })

        beforeEach(async () => {})

        afterEach(async () => {
            //await userService.deleteUser(userId)
        })

        // describe('Create User with Initial Coins', () => {
        //     it('should deposit', async () => {
        //         const depositUnits = 100
        //         const newTemplate = Object.assign({}, userTemplate, { initialCoins: depositUnits })
        //         const user = await userService.newUser(newTemplate)

        //         // verify that user has coins
        //         const portfolioId = user.portfolioId!!
        //         const madeUnits = await portfolioHoldingService.getPortfolioHoldingsBalance(portfolioId, 'coin::fantx')

        //         expect(madeUnits).to.eq(depositUnits, 'verify units deposited')
        //     })
        // })

        // describe('Deposit Coin with User', () => {
        //     it('should deposit', async () => {
        //         const user = await userService.newUser(userTemplate)
        //         userId = user.id

        //         const treasuryUnits = await portfolioHoldingService.getPortfolioHoldingsBalance(
        //             'bank::treasury',
        //             'coin::fantx',
        //         )

        //         const depositUnits = 100

        //         await userService.depositCoins(user.userId, depositUnits)

        //         // verify that user has coins
        //         const portfolioId = user.portfolioId!!
        //         const madeUnits = await portfolioHoldingService.getPortfolioHoldingsBalance(portfolioId, 'coin::fantx')
        //         const remainingTreasuryUnits = await portfolioHoldingService.getPortfolioHoldingsBalance(
        //             'bank::treasury',
        //             'coin::fantx',
        //         )

        //         expect(madeUnits).to.eq(depositUnits, 'verify units deposited')
        //         expect(treasuryUnits - remainingTreasuryUnits).to.eq(depositUnits, 'verify adjusted treasury units')
        //     })
        // })

        // describe("Withdraw Coin from User that user doesn't have", () => {
        //     it('should deposit', async () => {
        //         const user = await userService.newUser(userTemplate)
        //         userId = user.id

        //         const withdrawUnits = 100

        //         await userService
        //             .withdrawCoins(user.userId, withdrawUnits)
        //             .then(() => {
        //                 assert.fail('Function should not complete')
        //             })
        //             .catch((error: any) => {
        //                 expect(error).to.be.instanceOf(InsufficientBalance)
        //                 expect(error.message).to.eq(
        //                     `No input holding - input: 1 portfolio: ${user.portfolioId} holding: coin::fantx`,
        //                 )
        //             })
        //     })
        // })

        // describe("Withdraw Coin from User that user doesn't have", () => {
        //     it('should deposit', async () => {
        //         const user = await userService.newUser(userTemplate)
        //         userId = user.id

        //         // put some units in portfolio before withdraw
        //         const portfolioUnits = 1000
        //         await userService.depositCoins(user.userId, portfolioUnits)

        //         const treasuryUnits = await portfolioHoldingService.getPortfolioHoldingsBalance(
        //             'bank::treasury',
        //             'coin::fantx',
        //         )

        //         const withdrawUnits = 100
        //         await userService.withdrawCoins(user.userId, withdrawUnits)

        //         // verify that user has coins
        //         const portfolioId = user.portfolioId!!
        //         const madeUnits = await portfolioHoldingService.getPortfolioHoldingsBalance(portfolioId, 'coin::fantx')
        //         const remainingTreasuryUnits = await portfolioHoldingService.getPortfolioHoldingsBalance(
        //             'bank::treasury',
        //             'coin::fantx',
        //         )

        //         expect(portfolioUnits - madeUnits).to.eq(withdrawUnits, 'verify units withdrawn')
        //         expect(remainingTreasuryUnits - treasuryUnits).to.eq(withdrawUnits, 'verify adjusted treasury units')
        //     })
        // })
    })
})
