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
//     EarnerService,
// } from '../../src/services'
// import { BootstrapService } from '../../src/services'

// describe('Redeem asset ', function () {
//     this.timeout(30000)

//     let earnerService: EarnerService
//     let portfolioFactory: PortfolioFactory
//     let transactionService: TransactionService
//     let portfolioAssetService: PortfolioAssetService
//     let bootstrapService: BootstrapService
//     let leagueFactory: LeagueFactory

//     let eventPublisher: sinon.SinonStubbedInstance<EventPublisher>

//     before(async () => {
//         const db = firebase.firestore()
//         eventPublisher = sinon.createStubInstance(EventPublisher)

//         earnerService = new EarnerService(db, eventPublisher as any as EventPublisher)
//         portfolioAssetService = new PortfolioAssetService(db, eventPublisher as any as EventPublisher)
//         portfolioFactory = new PortfolioFactory(db, eventPublisher as any as EventPublisher)
//         leagueFactory = new LeagueFactory(db, eventPublisher as any as EventPublisher)
//         transactionService = new TransactionService(db, eventPublisher as any as EventPublisher)
//         bootstrapService = new BootstrapService(db, eventPublisher as any as EventPublisher)
//     })

//     beforeEach(async () => {
//         await bootstrapService.bootstrap() // create mynt, coin, and test league

//         // crete asset  card::jbone::test
//         await bootstrapService.setupTestAsset()

//         // setup new user portfolio: user:hedbot
//         await portfolioFactory.createPortfolio({
//             type: 'user',
//             ownerId: 'tester',
//             portfolioId: 'user::hedbot',
//         })

//         const leagueCoins = 1000
//         await transactionService.mintCoinsToPortfolio('league::test', leagueCoins)

//         // move 10 units to the user
//         const units = 10
//         await leagueFactory.mintLeagueAssetUnitsToPortfolio('user::hedbot', 'card::jbone::test', units)
//     })

//     describe('Redeem units of asset with no earnings.', () => {
//         it('should pull assets with no change in coin', async () => {
//             const userPortfolio = 'user::hedbot'
//             const assetId = 'card::jbone::test'
//             const units = 10

//             //user protfolio has units
//             const [assetUnitBalance, userUnitBalance, leagueCoins, userCoins] = await Promise.all([
//                 leagueFactory.getAssetUnitsIssued(assetId),
//                 portfolioAssetService.getPortfolioAssetBalance(userPortfolio, assetId),
//                 portfolioAssetService.getPortfolioAssetBalance('league::test', 'coin::fantx'),
//                 portfolioAssetService.getPortfolioAssetBalance(userPortfolio, 'coin::fantx'),
//             ])
//             cxonsole.log(
//                 `init: asset units: ${assetUnitBalance}, portfolio units: ${userUnitBalance} contratCoins: ${leagueCoins} userCoints: ${userCoins}`,
//             )

//             await leagueFactory.redeemAsset('card::jbone::test')

//             const [newAssetUnitBalance, newUserUnitBalance, newLeagueCoins, newUserCoins] = await Promise.all([
//                 leagueFactory.getAssetUnitsIssued(assetId),
//                 portfolioAssetService.getPortfolioAssetBalance(userPortfolio, assetId),
//                 portfolioAssetService.getPortfolioAssetBalance('league::test', 'coin::fantx'),
//                 portfolioAssetService.getPortfolioAssetBalance(userPortfolio, 'coin::fantx'),
//             ])

//             cxonsole.log(
//                 `after: asset units: ${newAssetUnitBalance}, portfolio units: ${newUserUnitBalance} contratCoins: ${newLeagueCoins} userCoints: ${newUserCoins}`,
//             )
//         })
//     })

//     describe('Redeem units of asset with accumulated earnings earnings.', () => {
//         it('should move funds from league to user portfolio', async () => {
//             const userPortfolio = 'user::hedbot'
//             const earnerId = 'card::jbone'
//             const assetId = 'card::jbone::test'
//             const units = 10

//             await earnerService.submitEarnings(earnerId, { units, event: { description: 'test earnings1' } })
//             await earnerService.submitEarnings(earnerId, { units, event: { description: 'test earnings2' } })

//             const [assetUnitBalance, userUnitBalance, leagueCoins, userCoins] = await Promise.all([
//                 leagueFactory.getAssetUnitsIssued(assetId),
//                 portfolioAssetService.getPortfolioAssetBalance(userPortfolio, assetId),
//                 portfolioAssetService.getPortfolioAssetBalance('league::test', 'coin::fantx'),
//                 portfolioAssetService.getPortfolioAssetBalance(userPortfolio, 'coin::fantx'),
//             ])
//             cxonsole.log(
//                 `init: asset units: ${assetUnitBalance}, portfolio units: ${userUnitBalance} leagueCoins: ${leagueCoins} userCoints: ${userCoins}`,
//             )

//             await leagueFactory.redeemAsset('card::jbone::test')

//             const [newAssetUnitBalance, newUserUnitBalance, newLeagueCoins, newUserCoins] = await Promise.all([
//                 leagueFactory.getAssetUnitsIssued(assetId),
//                 portfolioAssetService.getPortfolioAssetBalance(userPortfolio, assetId),
//                 portfolioAssetService.getPortfolioAssetBalance('league::test', 'coin::fantx'),
//                 portfolioAssetService.getPortfolioAssetBalance(userPortfolio, 'coin::fantx'),
//             ])

//             cxonsole.log(
//                 `after: asset units: ${newAssetUnitBalance}, portfolio units: ${newUserUnitBalance} leagueCoins: ${newLeagueCoins} userCoints: ${newUserCoins}`,
//             )
//         })
//     })
// })
