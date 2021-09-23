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
const chai_1 = require("chai");
const sinon = require("sinon");
const src_1 = require("../../src");
const bootstrapService_1 = require("../../src/maint/bootstrapService");
describe('League Service', function () {
    this.timeout(5000);
    let leagueRepository;
    let assetRepository;
    let profileRepository;
    let assetHolderService;
    let leagueService;
    let boostrapService;
    let leagueId = 'testleague1';
    before(() => __awaiter(this, void 0, void 0, function* () {
        leagueRepository = new src_1.LeagueRepository();
        profileRepository = new src_1.PortfolioRepository();
        assetRepository = new src_1.AssetRepository();
        assetHolderService = new src_1.AssetHolderService();
        leagueService = new src_1.LeagueService();
        boostrapService = new bootstrapService_1.BootstrapService();
    }));
    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
        //await boostrapService.clearDb()
        sinon.resetHistory();
    }));
    describe('Create Basic League', () => {
        beforeEach(() => __awaiter(this, void 0, void 0, function* () {
            yield leagueService.scrubLeague(leagueId);
        }));
        it('should create', () => __awaiter(this, void 0, void 0, function* () {
            const data = {
                ownerId: 'tester',
                leagueId: leagueId,
                portfolioId: `league::${leagueId}`,
            };
            yield leagueService.createLeague(data);
            const league = yield leagueRepository.getDetailAsync(leagueId);
            (0, chai_1.expect)(league).to.exist;
            (0, chai_1.expect)(league.leagueId).to.be.eq(leagueId);
            const portfolioId = `league::${leagueId}`;
            (0, chai_1.expect)(league.portfolioId).to.be.eq(portfolioId);
            const profile = yield profileRepository.getDetailAsync(portfolioId);
            (0, chai_1.expect)(profile).to.exist;
            (0, chai_1.expect)(profile.portfolioId).to.be.eq(portfolioId);
        }));
    });
    describe('Delete Empty League', () => {
        beforeEach(() => __awaiter(this, void 0, void 0, function* () {
            yield leagueService.scrubLeague(leagueId);
        }));
        it('should create', () => __awaiter(this, void 0, void 0, function* () {
            const data = {
                ownerId: 'tester',
                leagueId: leagueId,
                portfolioId: `league::${leagueId}`,
            };
            const league = yield leagueService.createLeague(data);
            yield leagueService.deleteLeague(league.leagueId);
            const readBack = yield leagueRepository.getDetailAsync(leagueId);
            (0, chai_1.expect)(readBack).to.not.exist;
        }));
    });
    // describe('Create Assets', () => {
    //     let leagueId: string = 'testleague1'
    //     let assetList: TLeagueEarnerDef[] = [
    //         { earnerId: 'card::aaa', displayName: 'helloa' },
    //         { earnerId: 'card::bbb', displayName: 'hellob' },
    //         { earnerId: 'card::ccc', displayName: 'helloc' },
    //         { earnerId: 'card::ddd', displayName: 'hellod' },
    //     ]
    //     beforeEach(async () => {
    //         await leagueService.scrubLeague(leagueId)
    //         await leagueService.newLeague({
    //             ownerId: 'tester',
    //             leagueId: leagueId,
    //             // earnerList: assetList,
    //         })
    //     })
    //     it('should create asset list', async () => {
    //         await leagueService.setupLeagueEarnerList(leagueId, assetList)
    //         const [asset1, asset2, asset3, asset4] = await Promise.all([
    //             assetRepository.getDetailAsync('card::aaa::testleague1'),
    //             assetRepository.getDetailAsync('card::bbb::testleague1'),
    //             assetRepository.getDetailAsync('card::ccc::testleague1'),
    //             assetRepository.getDetailAsync('card::ddd::testleague1'),
    //         ])
    //         expect(asset1).to.exist
    //         expect(asset2).to.exist
    //         expect(asset3).to.exist
    //         expect(asset4).to.exist
    //     })
    // })
    // describe('Mint Asset Units to portfolio', () => {
    //     it('should move asset units from asset league to portfolio', async () => {
    //         await boostrapService.fullBoot()
    //         await leagueService.mintLeagueAssetUnitsToPortfolio('user::hedbot', 'card::jbone::test', 10)
    //         // verify that treasury has balance of 10
    //         expect(await portfolioHoldingService.getPortfolioHoldingsBalance('user::hedbot', 'card::jbone::test')).to.eq(10)
    //         // verify that mint has balance of -10
    //         expect(await portfolioHoldingService.getPortfolioHoldingsBalance('league::test', 'card::jbone::test')).to.eq(
    //             -10,
    //         )
    //         //expect(eventPublisher.publishTransactionEventUpdatePortfolioAsync.callCount).to.eq(2)
    //         expect(eventPublisher.publishTransactionEventCompleteAsync.callCount).to.eq(1)
    //         expect(eventPublisher.publishTransactionEventErrorAsync.callCount).to.eq(0)
    //     })
    // })
});
