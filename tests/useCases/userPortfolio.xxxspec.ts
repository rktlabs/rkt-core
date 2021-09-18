// 'use strict'
// /* eslint-env node, mocha */

// import { expect } from 'chai'
// import * as sinon from 'sinon'
// import * as firebase from 'firebase-admin'

// import {
//     EventPublisher,
//     PortfolioService,
//     TransactionService,
//     PortfolioAssetService,
//     LeagueService,
// } from '../../src/services'
// import { BootstrapService } from '../../src/services'
// import { TPurchase } from '../../src/models'

// describe('User Use Case', function () {
//     this.timeout(5000)

//     let portfolioService: PortfolioService
//     let transactionService: TransactionService
//     let portfolioAssetService: PortfolioAssetService
//     let bootstrapService: BootstrapService
//     let leagueService: LeagueService

//     let eventPublisher: sinon.SinonStubbedInstance<EventPublisher>

//     before(async () => {
//         const db = firebase.firestore()
//         eventPublisher = sinon.createStubInstance(EventPublisher)

//         portfolioAssetService = new PortfolioAssetService(db, eventPublisher as any as EventPublisher)
//         portfolioService = new PortfolioService(db, eventPublisher as any as EventPublisher)
//         leagueService = new LeagueService(db, eventPublisher as any as EventPublisher)
//         transactionService = new TransactionService(db, eventPublisher as any as EventPublisher)
//         bootstrapService = new BootstrapService(db, eventPublisher as any as EventPublisher)
//     })

//     beforeEach(async () => {
//         await bootstrapService.clearDb()
//         await bootstrapService.bootstrap()

//         // setup new user portfolio: user:hedbot
//         await portfolioService.createPortfolio({
//             type: 'user',
//             ownerId: 'tester',
//             portfolioId: 'user::hedbot',
//         })

//         // crete asset  card::jbone::test
//         await leagueService.newAsset('test', {
//             earnerId: 'card::jbone',
//             displayName: 'Jbone Genie',
//         })
//     })

//     describe('Fund User Portfolio from System', () => {
//         it('should move funds from mint league to user portfolio', async () => {
//             const coins = 10

//             const systemBalance = await portfolioAssetService.getPortfolioAssetBalance('league::mint', 'coin::fantx')
//             const userBalance = await portfolioAssetService.getPortfolioAssetBalance('user::hedbot', 'coin::fantx')

//             // transfer coins from mint league to user portfolio
//             await transactionService.mintCoinsToPortfolio('user::hedbot', coins)

//             // verify that treasury changes balance by 10
//             expect(await portfolioAssetService.getPortfolioAssetBalance('user::hedbot', 'coin::fantx')).to.eq(
//                 userBalance + coins,
//             )

//             // verify that mint changes balance by -10
//             expect(await portfolioAssetService.getPortfolioAssetBalance('league::mint', 'coin::fantx')).to.eq(
//                 systemBalance - coins,
//             )
//         })
//     })

//     describe('Create Asset Units to User Portfolio', () => {
//         it('should move funds from mint league to user portfolio', async () => {
//             const userPortfolio = 'user::hedbot'
//             const assetId = 'card::jbone::test'
//             const units = 10

//             const [assetUnitBalance, userUnitBalance] = await Promise.all([
//                 leagueService.getAssetUnitsIssued(assetId),
//                 portfolioAssetService.getPortfolioAssetBalance(userPortfolio, assetId),
//             ])

//             // transfer coins from mint league to user portfolio
//             await leagueService.mintLeagueAssetUnitsToPortfolio('user::hedbot', 'card::jbone::test', units)

//             const [newAssetUnitBalance, newUserUnitBalance] = await Promise.all([
//                 leagueService.getAssetUnitsIssued(assetId),
//                 portfolioAssetService.getPortfolioAssetBalance(userPortfolio, assetId),
//             ])

//             // verify that treasury changes balance by 10
//             expect(newUserUnitBalance).to.eq(userUnitBalance + units)

//             // verify that mint changes balance by -10
//             expect(newAssetUnitBalance).to.eq(assetUnitBalance - units)
//         })
//     })

//     describe('Transaction (purchase) to exchange coin for units', () => {
//         it('should move funds from mint league to user portfolio', async () => {
//             const userPortfolio = 'user::hedbot'
//             const userFunds = 100
//             const assetLeaguePortfolio = 'league::test'
//             const assetId = 'card::jbone::test'
//             const units = 2
//             const coins = 11

//             // transfer coins from mint league to user portfolio
//             await transactionService.mintCoinsToPortfolio(userPortfolio, userFunds)

//             const [systemCoinBalance, userCoinBalance, assetUnitBalance, userUnitBalance] = await Promise.all([
//                 portfolioAssetService.getPortfolioAssetBalance(assetLeaguePortfolio, 'coin::fantx'),
//                 portfolioAssetService.getPortfolioAssetBalance(userPortfolio, 'coin::fantx'),
//                 leagueService.getAssetUnitsIssued(assetId),
//                 portfolioAssetService.getPortfolioAssetBalance(userPortfolio, assetId),
//             ])

//             const data: TPurchase = {
//                 buyerPorfolioId: userPortfolio,
//                 sellerPortfolioId: assetLeaguePortfolio,
//                 assetId: assetId,
//                 units: units,
//                 coins: coins,
//             }
//             await transactionService.newPurchaseAsync(data)

//             const [newSystemCoinBalance, newUserCoinBalance, newAssetUnitBalance, newUserUnitBalance] =
//                 await Promise.all([
//                     portfolioAssetService.getPortfolioAssetBalance(assetLeaguePortfolio, 'coin::fantx'),
//                     portfolioAssetService.getPortfolioAssetBalance(userPortfolio, 'coin::fantx'),
//                     leagueService.getAssetUnitsIssued(assetId),
//                     portfolioAssetService.getPortfolioAssetBalance(userPortfolio, assetId),
//                 ])

//             expect(newSystemCoinBalance).to.eq(systemCoinBalance + coins)
//             expect(newAssetUnitBalance).to.eq(assetUnitBalance - units)
//             expect(newUserCoinBalance).to.eq(userCoinBalance - coins)
//             expect(newUserUnitBalance).to.eq(userUnitBalance + units)
//         })
//     })

//     describe('Transaction (buy) to exchange coin for units', () => {
//         it('should move funds from mint league to user portfolio', async () => {
//             const userPortfolio = 'user::hedbot'
//             const userFunds = 100
//             const assetLeaguePortfolio = 'league::test'
//             const assetId = 'card::jbone::test'
//             const units = 2
//             const coins = 11

//             // transfer coins from mint league to user portfolio
//             await transactionService.mintCoinsToPortfolio(userPortfolio, userFunds)

//             const [systemCoinBalance, userCoinBalance, assetUnitBalance, userUnitBalance] = await Promise.all([
//                 portfolioAssetService.getPortfolioAssetBalance(assetLeaguePortfolio, 'coin::fantx'),
//                 portfolioAssetService.getPortfolioAssetBalance(userPortfolio, 'coin::fantx'),
//                 leagueService.getAssetUnitsIssued(assetId),
//                 portfolioAssetService.getPortfolioAssetBalance(userPortfolio, assetId),
//             ])

//             await leagueService.buyLeagueAsset(userPortfolio, assetId, units, coins)

//             const [newSystemCoinBalance, newUserCoinBalance, newAssetUnitBalance, newUserUnitBalance] =
//                 await Promise.all([
//                     portfolioAssetService.getPortfolioAssetBalance(assetLeaguePortfolio, 'coin::fantx'),
//                     portfolioAssetService.getPortfolioAssetBalance(userPortfolio, 'coin::fantx'),
//                     leagueService.getAssetUnitsIssued(assetId),
//                     portfolioAssetService.getPortfolioAssetBalance(userPortfolio, assetId),
//                 ])

//             expect(newSystemCoinBalance).to.eq(systemCoinBalance + coins)
//             expect(newAssetUnitBalance).to.eq(assetUnitBalance - units)
//             expect(newUserCoinBalance).to.eq(userCoinBalance - coins)
//             expect(newUserUnitBalance).to.eq(userUnitBalance + units)
//         })
//     })
// })
