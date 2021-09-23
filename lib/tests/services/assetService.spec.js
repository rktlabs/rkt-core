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
describe('Asset Service', function () {
    this.timeout(5000);
    let assetRepository;
    let portfolioRepository;
    let assetService;
    let bootstrapper;
    const assetId = 'card::test1';
    before(() => __awaiter(this, void 0, void 0, function* () {
        assetRepository = new src_1.AssetRepository();
        portfolioRepository = new src_1.PortfolioRepository();
        assetService = new src_1.AssetService();
        bootstrapper = new bootstrapService_1.BootstrapService();
        //await bootstrapper.clearDb()
        yield bootstrapper.bootstrap();
    }));
    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
        yield assetService.scrubAsset(assetId);
        sinon.resetHistory();
    }));
    afterEach(() => __awaiter(this, void 0, void 0, function* () { }));
    after(() => __awaiter(this, void 0, void 0, function* () {
        yield Promise.all([assetService.scrubAsset(assetId)]);
    }));
    describe('Create Basic Asset - no portfolio', () => {
        it('should create', () => __awaiter(this, void 0, void 0, function* () {
            const data = {
                ownerId: 'tester',
                symbol: assetId,
                displayName: 'display-me',
                leagueId: 'theLeagueId',
                leagueDisplayName: 'theLeagueDisplayName',
            };
            yield assetService.createAsset(data);
            const readBack = yield assetRepository.getDetailAsync(assetId);
            (0, chai_1.expect)(readBack).to.exist;
        }));
    });
    describe('Create Basic Asset - with portfolio', () => {
        it('should create', () => __awaiter(this, void 0, void 0, function* () {
            const data = {
                ownerId: 'tester',
                symbol: assetId,
                displayName: 'display-me',
                leagueId: 'theLeagueId',
                leagueDisplayName: 'theLeagueDisplayName',
            };
            yield assetService.createAsset(data, true);
            const readBack = yield assetRepository.getDetailAsync(assetId);
            (0, chai_1.expect)(readBack).to.exist;
            const portfolioId = readBack.portfolioId;
            (0, chai_1.expect)(portfolioId).to.exist;
            const portfolio = yield portfolioRepository.getDetailAsync(portfolioId);
            (0, chai_1.expect)(portfolio).to.exist;
        }));
    });
    describe('Create Asset where already exists', () => {
        it('should create new portfolio', () => __awaiter(this, void 0, void 0, function* () {
            const data = {
                ownerId: 'tester',
                symbol: assetId,
                displayName: 'display-me',
                leagueId: 'theLeagueId',
                leagueDisplayName: 'theLeagueDisplayName',
            };
            yield assetService.createAsset(data);
            const readBack = yield assetRepository.getDetailAsync(assetId);
            (0, chai_1.expect)(readBack).to.exist;
            yield assetService
                .createAsset(data)
                .then(() => {
                chai_1.assert.fail('Function should not complete');
            })
                .catch((error) => {
                (0, chai_1.expect)(error).to.be.instanceOf(Error);
                (0, chai_1.expect)(error.message).to.eq('Asset Creation Failed - assetId: card::test1 already exists');
            });
        }));
    });
});
