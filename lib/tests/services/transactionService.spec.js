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
const sinon = require("sinon");
const src_1 = require("../../src");
const bootstrapService_1 = require("../../src/maint/bootstrapService");
describe('Transaction Service', function () {
    this.timeout(5000);
    let transactionRepository;
    let bootstrapper;
    let portfolioService;
    let assetHolderService;
    let assetService;
    let transactionService;
    let eventPublisher;
    before(() => __awaiter(this, void 0, void 0, function* () {
        eventPublisher = sinon.createStubInstance(src_1.NullNotificationPublisher);
        transactionRepository = new src_1.TransactionRepository();
        portfolioService = new src_1.PortfolioService();
        assetHolderService = new src_1.AssetHolderService();
        assetService = new src_1.AssetService();
        transactionService = new src_1.TransactionService(eventPublisher);
        bootstrapper = new bootstrapService_1.BootstrapService();
        //await bootstrapper.clearDb()
        yield bootstrapper.fullBoot();
    }));
    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
        sinon.resetHistory();
    }));
    afterEach(() => __awaiter(this, void 0, void 0, function* () { }));
    after(() => __awaiter(this, void 0, void 0, function* () {
        //await bootstrapper.scrub(),
    }));
    // describe('Fund Portfolio', () => {
    //     it('should move funds from mint league to user portfolio', async () => {
    //         await transactionService.mintCoinsToPortfolio('user::hedbot', 10)
    //         // verify that treasury has balance of 10
    //         expect(await portfolioHoldingService.getPortfolioHoldingsBalance('user::hedbot', 'coin::fantx')).to.eq(10)
    //         // verify that mint has balance of -10
    //         expect(await portfolioHoldingService.getPortfolioHoldingsBalance('league::mynt', 'coin::fantx')).to.eq(-10)
    //         //expect(eventPublisher.publishTransactionEventUpdatePortfolioAsync.callCount).to.eq(2)
    //         expect(eventPublisher.publishTransactionEventCompleteAsync.callCount).to.eq(1)
    //         expect(eventPublisher.publishTransactionEventErrorAsync.callCount).to.eq(0)
    //     })
    // })
    // describe('Mint Non-existent Asset Units to portfolio', () => {
    //     it('should create', async () => {
    //         await transactionService
    //             .mintUnitsToPortfolio('user::hedbot', 'card::xxx', 10)
    //             .then(() => {
    //                 assert.fail('Function should not complete')
    //             })
    //             .catch((error: any) => {
    //                 expect(error).to.be.instanceOf(Error)
    //                 expect(error.message).to.eq('Cannot mint asset: card::xxx does not exist')
    //             })
    //     })
    // })
    // describe('Mint Asset Units to Non-existent portfolio', () => {
    //     it('should create', async () => {
    //         await transactionService
    //             .mintUnitsToPortfolio('user::xxx', 'card::jbone::test', 10)
    //             .then(() => {
    //                 assert.fail('Function should not complete')
    //             })
    //             .catch((error: any) => {
    //                 expect(error).to.be.instanceOf(Error)
    //                 expect(error.message).to.eq('Cannot mint to portfolio: user::xxx does not exist')
    //             })
    //     })
    // })
});
