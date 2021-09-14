// 'use strict'
// /* eslint-env node, mocha */

// import { expect } from 'chai'
// import * as chai from 'chai'
// import * as chaiSubset from 'chai-subset'
// chai.use(chaiSubset)
// import * as sinon from 'sinon'

// import { getLogger, Logger } from 'log4js'
// import { Publisher, EventPublisher } from '../../src/services'

// import { Asset, Portfolio, TNewAsset } from '../../src/models'

// describe('EventPublisher Service', () => {
//     let eventPublisher: EventPublisher
//     let publisherStub: sinon.SinonStub
//     let clock: sinon.SinonFakeTimers

//     before(async () => {
//         const logger = getLogger('testtest')
//         const publisher = new Publisher({ logger: logger })
//         eventPublisher = new EventPublisher({ publisher: publisher })

//         publisherStub = sinon.stub(publisher, 'publishMessageToTopicAsync')
//         clock = sinon.useFakeTimers(new Date(2020, 10, 11, 11, 11, 11))
//     })

//     after(async () => {
//         publisherStub.restore()
//         clock.restore()
//     })

//     afterEach(async () => {
//         publisherStub.resetHistory()
//     })

//     describe('Publish Event', () => {
//         it('should send warning to pubsub', async () => {
//             await eventPublisher.publishErrorEventAsync({ this: 'is', an: 'error' }, 'testSource')

//             expect(publisherStub.callCount).to.eq(1)
//             expect(publisherStub.getCall(0).args[0]).to.eq('errorEvent') // topic

//             expect(publisherStub.getCall(0).args[1]).to.eql({
//                 eventType: 'Error',
//                 publishedAt: '2020-11-11T16:11:11.000Z',
//                 attributes: {
//                     an: 'error',
//                     this: 'is',
//                 },
//                 source: 'testSource',
//             })
//         })
//     })

//     describe('Publish Warning', () => {
//         it('should send warning to pubsub', async () => {
//             await eventPublisher.publishWarningEventAsync({ this: 'is', an: 'error' }, 'testSource')

//             expect(publisherStub.callCount).to.eq(1)
//             expect(publisherStub.getCall(0).args[0]).to.eq('errorEvent') // topic

//             expect(publisherStub.getCall(0).args[1]).to.eql({
//                 eventType: 'Warning',
//                 publishedAt: '2020-11-11T16:11:11.000Z',
//                 attributes: {
//                     an: 'error',
//                     this: 'is',
//                 },
//                 source: 'testSource',
//             })
//         })
//     })

//     // describe('Publish New Asset', () => {
//     //     it('should send message to pubsub', async () => {
//     //         const data: TNewAsset = {
//     //             ownerId: 'tester',
//     //             symbol: 'card::the.card',
//     //             leagueId: 'theLeagueId',
//     //             leagueDisplayName: 'theLeagueDisplayName',
//     //             earnerId: 'theEarnerId',
//     //             earnerDisplayName: 'theEarnerDisplayName',
//     //         }
//     //         const asset = Asset.newAsset(data)

//     //         //await eventPublisher.publishAssetCreateAsync(asset, 'testSource')

//     //         expect(publisherStub.callCount).to.eq(1)
//     //         expect(publisherStub.getCall(0).args[0]).to.eq('assetCreate') // topic

//     //         expect(publisherStub.getCall(0).args[1]).to.containSubset({
//     //             eventType: 'AssetNew',
//     //             publishedAt: '2020-11-11T16:11:11.000Z',
//     //             attributes: {
//     //                 createdAt: '2020-11-11T16:11:11.000+00:00',
//     //                 type: 'card',
//     //                 assetId: 'card::the.card',
//     //                 ownerId: 'tester',
//     //                 displayName: 'card::the.card',
//     //                 leagueId: 'theLeagueId',
//     //                 leagueDisplayName: 'theLeagueDisplayName',
//     //                 earnerId: 'theEarnerId',
//     //                 earnerDisplayName: 'theEarnerDisplayName',
//     //             },
//     //             source: 'testSource',
//     //         })
//     //     })
//     // })

//     // describe('Publish New Portfolio', () => {
//     //     it('should send message to pubsub', async () => {
//     //         const portfolio = Portfolio.newPortfolio({
//     //             type: 'aaa',
//     //             ownerId: 'tester',
//     //             portfolioId: 'aaa::test1',
//     //         })

//     //         //await eventPublisher.publishPortfolioCreateAsync(portfolio, 'testSource')

//     //         expect(publisherStub.callCount).to.eq(1)
//     //         expect(publisherStub.getCall(0).args[0]).to.eq('portfolioCreate') // topic

//     //         expect(publisherStub.getCall(0).args[1]).to.containSubset({
//     //             eventType: 'PortfolioNew',
//     //             publishedAt: '2020-11-11T16:11:11.000Z',
//     //             attributes: {
//     //                 portfolioId: 'aaa::test1',
//     //                 createdAt: '2020-11-11T16:11:11.000+00:00',
//     //                 type: 'aaa',
//     //                 displayName: 'aaa::test1',
//     //                 ownerId: 'tester',
//     //             },
//     //             source: 'testSource',
//     //         })
//     //     })
//     // })

//     // describe('Publish New Transaction',() => {
//     //   it('should send message to pubsub', async () => {

//     //   const transaction = {
//     //     inputs: [
//     //         {
//     //             portfolioId: inputPortfolioId,
//     //             assetId: assetId,
//     //             units: -1 * units,
//     //         },
//     //     ],
//     //     outputs: [
//     //         {
//     //             portfolioId: outputPortfolioId,
//     //             assetId: assetId,
//     //             units: units,
//     //         },
//     //     ],
//     // }

//     //     await eventPublisher.publishTransactionCreateAsync( transaction, "testSource" )

//     //     expect(mySpy.callCount).to.eq(1)
//     //     expect(mySpy.getCall(0).args[0]).to.eq('transactionCreate') // topic

//     //     expect(mySpy.getCall(0).args[1]).to.containSubset({
//     //         eventType: "TransactionNew",
//     //         publishedAt: "2020-11-11T16:11:11.000Z",
//     //         attributes: {
//     //     inputs: [
//     //         {
//     //             portfolioId: inputPortfolioId,
//     //             assetId: assetId,
//     //             units: -1 * units,
//     //         },
//     //     ],
//     //     outputs: [
//     //         {
//     //             portfolioId: outputPortfolioId,
//     //             assetId: assetId,
//     //             units: units,
//     //         },
//     //     ],
//     //                     },
//     //         source: "testSource",
//     //       })
//     //   })
//     // })

//     // describe('Publish New ExchangeOrder',() => {
//     //   it('should send message to pubsub', async () => {

//     //     const exchangeOrder = ExchangeOrder.newExchangeOrder({
//     // operation: string
//     // type: string
//     // side: string
//     // assetId: string
//     // portfolioId: string
//     // price: number
//     // size: number
//     // orderId?: string
//     // tags?: any
//     // refOrderId?: string
//     //     })

//     //     await eventPublisher.publishExchangeOrderCreateAsync( exchangeOrder, "testSource" )

//     //     expect(mySpy.callCount).to.eq(1)
//     //     expect(mySpy.getCall(0).args[0]).to.eq('exchangeOrderCreate') // topic

//     //     expect(mySpy.getCall(0).args[1]).to.containSubset({
//     //         eventType: "ExchangeOrderNew",
//     //         publishedAt: "2020-11-11T16:11:11.000Z",
//     //         attributes: {
//     // operation: string
//     // type: string
//     // side: string
//     // assetId: string
//     // portfolioId: string
//     // price: number
//     // size: number
//     // orderId?: string
//     // tags?: any
//     // refOrderId?: string
//     //                     },
//     //         source: "testSource",
//     //       })
//     //   })
//     // })
// })
