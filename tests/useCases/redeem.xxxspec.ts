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
//     EarnerService,
// } from '../../src/services'
// import { BootstrapService } from '../../src/services'

// describe('Redeem asset ', function () {
//     this.timeout(15000)

//     let earnerService: EarnerService
//     let portfolioService: PortfolioService
//     let transactionService: TransactionService
//     let portfolioAssetService: PortfolioAssetService
//     let bootstrapService: BootstrapService
//     let leagueService: LeagueService

//     let eventPublisher: sinon.SinonStubbedInstance<EventPublisher>

//     before(async () => {
//         const db = firebase.firestore()
//         eventPublisher = sinon.createStubInstance(EventPublisher)

//         earnerService = new EarnerService(db, eventPublisher as any as EventPublisher)
//         portfolioAssetService = new PortfolioAssetService(db, eventPublisher as any as EventPublisher)
//         portfolioService = new PortfolioService(db, eventPublisher as any as EventPublisher)
//         leagueService = new LeagueService(db, eventPublisher as any as EventPublisher)
//         transactionService = new TransactionService(db, eventPublisher as any as EventPublisher)
//         bootstrapService = new BootstrapService(db, eventPublisher as any as EventPublisher)
//     })

//     beforeEach(async () => {
//         await bootstrapService.clearDb()
//         await bootstrapService.bootstrap() // create mint, coin, and test league

//         // crete asset  card::jbone::test
//         await bootstrapService.setupTestAsset()

//         // setup new user portfolio: user:hedbot
//         await portfolioService.createPortfolio({
//             type: 'user',
//             ownerId: 'tester',
//             portfolioId: 'user::hedbot',
//         })

//         const leagueCoins = 1000
//         await transactionService.mintCoinsToPortfolio('league::test', leagueCoins)

//         // move 10 units to the user
//         const units = 10
//         await leagueService.mintLeagueAssetUnitsToPortfolio('user::hedbot', 'card::jbone::test', units)
//     })

//     describe('Redeem units of asset with no earnings.', () => {
//         it('should pull assets with no change in coin', async () => {
//             const userPortfolio = 'user::hedbot'
//             const assetId = 'card::jbone::test'
//             const units = 10

//             //user protfolio has units
//             const [assetUnitBalance, userUnitBalance, leagueCoins, userCoins] = await Promise.all([
//                 leagueService.getAssetUnitsIssued(assetId),
//                 portfolioAssetService.getPortfolioAssetBalance(userPortfolio, assetId),
//                 portfolioAssetService.getPortfolioAssetBalance('league::test', 'coin::fantx'),
//                 portfolioAssetService.getPortfolioAssetBalance(userPortfolio, 'coin::fantx'),
//             ])
//             console.log(
//                 `init: asset units: ${assetUnitBalance}, portfolio units: ${userUnitBalance} contratCoins: ${leagueCoins} userCoints: ${userCoins}`,
//             )

//             await leagueService.redeemAsset('card::jbone::test')

//             const [newAssetUnitBalance, newUserUnitBalance, newLeagueCoins, newUserCoins] = await Promise.all([
//                 leagueService.getAssetUnitsIssued(assetId),
//                 portfolioAssetService.getPortfolioAssetBalance(userPortfolio, assetId),
//                 portfolioAssetService.getPortfolioAssetBalance('league::test', 'coin::fantx'),
//                 portfolioAssetService.getPortfolioAssetBalance(userPortfolio, 'coin::fantx'),
//             ])

//             console.log(
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
//                 leagueService.getAssetUnitsIssued(assetId),
//                 portfolioAssetService.getPortfolioAssetBalance(userPortfolio, assetId),
//                 portfolioAssetService.getPortfolioAssetBalance('league::test', 'coin::fantx'),
//                 portfolioAssetService.getPortfolioAssetBalance(userPortfolio, 'coin::fantx'),
//             ])
//             console.log(
//                 `init: asset units: ${assetUnitBalance}, portfolio units: ${userUnitBalance} leagueCoins: ${leagueCoins} userCoints: ${userCoins}`,
//             )

//             await leagueService.redeemAsset('card::jbone::test')

//             const [newAssetUnitBalance, newUserUnitBalance, newLeagueCoins, newUserCoins] = await Promise.all([
//                 leagueService.getAssetUnitsIssued(assetId),
//                 portfolioAssetService.getPortfolioAssetBalance(userPortfolio, assetId),
//                 portfolioAssetService.getPortfolioAssetBalance('league::test', 'coin::fantx'),
//                 portfolioAssetService.getPortfolioAssetBalance(userPortfolio, 'coin::fantx'),
//             ])

//             console.log(
//                 `after: asset units: ${newAssetUnitBalance}, portfolio units: ${newUserUnitBalance} leagueCoins: ${newLeagueCoins} userCoints: ${newUserCoins}`,
//             )
//         })
//     })
// })
