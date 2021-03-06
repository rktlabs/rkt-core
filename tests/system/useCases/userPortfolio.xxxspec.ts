// 'use strict'
// /* eslint-env node, mocha */

// import { expect } from 'chai'
// import * as sinon from 'sinon'
// import * as firebase from 'firebase-admin'

// import {
//     EventPublisher,
//     PortfolioFactory,
//     TransactionService,
//     PortfolioAssetService,
//     LeagueFactory,
// } from '../../src/services'
// import { BootstrapService } from '../../src/services'
// import { TPurchase } from '../../src/models'

// describe('User Use Case', function () {
//     this.timeout(3000)

//     let portfolioFactory: PortfolioFactory
//     let transactionService: TransactionService
//     let portfolioAssetService: PortfolioAssetService
//     let bootstrapService: BootstrapService
//     let leagueFactory: LeagueFactory

//     let eventPublisher: sinon.SinonStubbedInstance<EventPublisher>

//     before(async () => {
//         const db = firebase.firestore()
//         eventPublisher = sinon.createStubInstance(EventPublisher)

//         portfolioAssetService = new PortfolioAssetService(db, eventPublisher as any as EventPublisher)
//         portfolioFactory = new PortfolioFactory(db, eventPublisher as any as EventPublisher)
//         leagueFactory = new LeagueFactory(db, eventPublisher as any as EventPublisher)
//         transactionService = new TransactionService(db, eventPublisher as any as EventPublisher)
//         bootstrapService = new BootstrapService(db, eventPublisher as any as EventPublisher)
//     })

//     beforeEach(async () => {
//         await bootstrapService.bootstrap()

//         // setup new user portfolio: user:hedbot
//         await portfolioFactory.createPortfolio({
//             type: 'user',
//             ownerId: 'tester',
//             portfolioId: 'user::hedbot',
//         })

//         // crete asset  card::jbone::test
//         await leagueFactory.newAsset('test', {
//             earnerId: 'card::jbone',
//             displayName: 'Jbone Genie',
//         })
//     })

//     describe('Fund User Portfolio from System', () => {
//         it('should move funds from mynt league to user portfolio', async () => {
//             const coins = 10

//             const systemBalance = await portfolioAssetService.getPortfolioAssetBalance('league::mynt', 'coin::fantx')
//             const userBalance = await portfolioAssetService.getPortfolioAssetBalance('user::hedbot', 'coin::fantx')

//             // transfer coins from mynt league to user portfolio
//             await transactionService.mintCoinsToPortfolio('user::hedbot', coins)

//             // verify that treasury changes balance by 10
//             expect(await portfolioAssetService.getPortfolioAssetBalance('user::hedbot', 'coin::fantx')).to.eq(
//                 userBalance + coins,
//             )

//             // verify that mynt changes balance by -10
//             expect(await portfolioAssetService.getPortfolioAssetBalance('league::mynt', 'coin::fantx')).to.eq(
//                 systemBalance - coins,
//             )
//         })
//     })

//     describe('Create Asset Units to User Portfolio', () => {
//         it('should move funds from mynt league to user portfolio', async () => {
//             const userPortfolio = 'user::hedbot'
//             const assetId = 'card::jbone::test'
//             const units = 10

//             const [assetUnitBalance, userUnitBalance] = await Promise.all([
//                 leagueFactory.getAssetUnitsIssued(assetId),
//                 portfolioAssetService.getPortfolioAssetBalance(userPortfolio, assetId),
//             ])

//             // transfer coins from mynt league to user portfolio
//             await leagueFactory.mintLeagueAssetUnitsToPortfolio('user::hedbot', 'card::jbone::test', units)

//             const [newAssetUnitBalance, newUserUnitBalance] = await Promise.all([
//                 leagueFactory.getAssetUnitsIssued(assetId),
//                 portfolioAssetService.getPortfolioAssetBalance(userPortfolio, assetId),
//             ])

//             // verify that treasury changes balance by 10
//             expect(newUserUnitBalance).to.eq(userUnitBalance + units)

//             // verify that mynt changes balance by -10
//             expect(newAssetUnitBalance).to.eq(assetUnitBalance - units)
//         })
//     })

//     describe('Transaction (purchase) to exchange coin for units', () => {
//         it('should move funds from mynt league to user portfolio', async () => {
//             const userPortfolio = 'user::hedbot'
//             const userFunds = 100
//             const assetLeaguePortfolio = 'league::test'
//             const assetId = 'card::jbone::test'
//             const units = 2
//             const coins = 11

//             // transfer coins from mynt league to user portfolio
//             await transactionService.mintCoinsToPortfolio(userPortfolio, userFunds)

//             const [systemCoinBalance, userCoinBalance, assetUnitBalance, userUnitBalance] = await Promise.all([
//                 portfolioAssetService.getPortfolioAssetBalance(assetLeaguePortfolio, 'coin::fantx'),
//                 portfolioAssetService.getPortfolioAssetBalance(userPortfolio, 'coin::fantx'),
//                 leagueFactory.getAssetUnitsIssued(assetId),
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
//                     leagueFactory.getAssetUnitsIssued(assetId),
//                     portfolioAssetService.getPortfolioAssetBalance(userPortfolio, assetId),
//                 ])

//             expect(newSystemCoinBalance).to.eq(systemCoinBalance + coins)
//             expect(newAssetUnitBalance).to.eq(assetUnitBalance - units)
//             expect(newUserCoinBalance).to.eq(userCoinBalance - coins)
//             expect(newUserUnitBalance).to.eq(userUnitBalance + units)
//         })
//     })

//     describe('Transaction (buy) to exchange coin for units', () => {
//         it('should move funds from mynt league to user portfolio', async () => {
//             const userPortfolio = 'user::hedbot'
//             const userFunds = 100
//             const assetLeaguePortfolio = 'league::test'
//             const assetId = 'card::jbone::test'
//             const units = 2
//             const coins = 11

//             // transfer coins from mynt league to user portfolio
//             await transactionService.mintCoinsToPortfolio(userPortfolio, userFunds)

//             const [systemCoinBalance, userCoinBalance, assetUnitBalance, userUnitBalance] = await Promise.all([
//                 portfolioAssetService.getPortfolioAssetBalance(assetLeaguePortfolio, 'coin::fantx'),
//                 portfolioAssetService.getPortfolioAssetBalance(userPortfolio, 'coin::fantx'),
//                 leagueFactory.getAssetUnitsIssued(assetId),
//                 portfolioAssetService.getPortfolioAssetBalance(userPortfolio, assetId),
//             ])

//             await leagueFactory.buyLeagueAsset(userPortfolio, assetId, units, coins)

//             const [newSystemCoinBalance, newUserCoinBalance, newAssetUnitBalance, newUserUnitBalance] =
//                 await Promise.all([
//                     portfolioAssetService.getPortfolioAssetBalance(assetLeaguePortfolio, 'coin::fantx'),
//                     portfolioAssetService.getPortfolioAssetBalance(userPortfolio, 'coin::fantx'),
//                     leagueFactory.getAssetUnitsIssued(assetId),
//                     portfolioAssetService.getPortfolioAssetBalance(userPortfolio, assetId),
//                 ])

//             expect(newSystemCoinBalance).to.eq(systemCoinBalance + coins)
//             expect(newAssetUnitBalance).to.eq(assetUnitBalance - units)
//             expect(newUserCoinBalance).to.eq(userCoinBalance - coins)
//             expect(newUserUnitBalance).to.eq(userUnitBalance + units)
//         })
//     })
// })
