'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-env node, mocha */
// import { expect } from 'chai'
const chai = require("chai");
const chaiSubset = require("chai-subset");
chai.use(chaiSubset);
// import * as sinon from 'sinon'
// import { getLogger } from 'log4js'
// import { EventPublisher, Publisher, TNewOrderProps } from '../../src'
// import { BootstrapService } from '../../src/maint/bootstrapService'
describe('Order Service', function () {
    this.timeout(5000);
    // let orderRepository: OrderRepository
    // let orderService: OrderService
    // let bootstrapper: BootstrapService
    // let eventPublisher: EventPublisher
    // let publisherStub: sinon.SinonStub
    before(() => __awaiter(this, void 0, void 0, function* () {
        // const logger = getLogger('testtest')
        // const publisher = new Publisher({ logger: logger })
        // eventPublisher = new EventPublisher({ publisher: publisher })
        // publisherStub = sinon.stub(publisher, 'publishMessageToTopicAsync')
        // orderRepository = new OrderRepository()
        // orderService = new OrderService(eventPublisher as any as EventPublisher)
        // bootstrapper = new BootstrapService(eventPublisher as any as EventPublisher)
        // //await bootstrapper.clearDb()
        // await bootstrapper.fullBoot()
    }));
    // beforeEach(async () => {
    //     sinon.resetHistory()
    // })
    // afterEach(async () => {
    //     publisherStub.resetHistory()
    // })
    // after(async () => {
    //     publisherStub.restore()
    // })
    // describe('Create Basic Order - no portfolio', () => {
    //     it('should create', async () => {
    //         const portfolioId = 'user::hedbot'
    //         const data: TNewOrderProps = {
    //             assetId: 'card::jbone::test',
    //             portfolioId: portfolioId,
    //             orderSide: 'bid',
    //             orderSize: 2,
    //             orderType: 'market',
    //         }
    //         const order = await orderService.createOrder(data)
    //         const readBack = await orderRepository.getPortfolioOrder(portfolioId, order.orderId)
    //         expect(readBack).to.exist
    //         expect(publisherStub.callCount).to.eq(1)
    //         expect(publisherStub.getCall(0).args[0]).to.eq('exchangeOrderCreate') // topic
    //         const event = publisherStub.getCall(0).args[1]
    //         expect(event).to.containSubset({
    //             eventType: 'ExchangeOrderNew',
    //             // publishedAt: '2020-11-11T16:11:11.000Z',
    //             // nonce: '111111111',
    //             attributes: {
    //                 assetId: 'card::jbone::test',
    //                 operation: 'order',
    //                 //orderId: "ORDER::SVH3KPVD",
    //                 orderSide: 'bid',
    //                 orderSize: 2,
    //                 orderType: 'market',
    //                 portfolioId: 'user::hedbot',
    //             },
    //             source: 'orderHandler',
    //         })
    //         expect(event.publishedAt).to.exist
    //         expect(event.nonce).to.exist
    //         expect(event.attributes.orderId).to.exist
    //     })
    // })
});
