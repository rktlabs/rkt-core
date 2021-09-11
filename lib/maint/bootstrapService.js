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
exports.BootstrapService = void 0;
const firebase = require("firebase-admin");
const __1 = require("..");
const getConnectionProps_1 = require("../repositories/getConnectionProps");
class BootstrapService {
    constructor(eventPublisher) {
        this.assetRepository = new __1.AssetRepository();
        this.portfolioRepository = new __1.PortfolioRepository();
        this.portfolioService = new __1.PortfolioService();
        this.portfolioHoldingsService = new __1.PortfolioHoldingsService();
        this.leagueService = new __1.LeagueService();
        this.transactionService = new __1.TransactionService(eventPublisher);
    }
    // bootstrap the system with the "mint" league and the "coin" asset
    bootMint() {
        return __awaiter(this, void 0, void 0, function* () {
            const mintLeague = yield this.leagueService.newLeague({
                ownerId: 'system',
                leagueId: 'mint',
            });
            // await this.leagueService.newSimpleAsset(mintLeague, 'coin', 'fantx')
        });
    }
    bootTestLeague() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.leagueService.newLeague({
                ownerId: 'test',
                leagueId: 'test',
            });
        });
    }
    bootstrap() {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all([this.bootMint(), this.bootTestLeague()]);
        });
    }
    setupTestAsset() {
        return __awaiter(this, void 0, void 0, function* () {
            const leagueId = 'test';
            const assetId = 'card::jbone';
            let asset = yield this.assetRepository.getDetailAsync(assetId);
            if (!asset) {
                yield this.leagueService.newAsset(leagueId, {
                    assetId: assetId,
                    displayName: assetId,
                    initialPrice: 11,
                });
            }
        });
    }
    setupAccount() {
        return __awaiter(this, void 0, void 0, function* () {
            let portfolio = yield this.portfolioRepository.getDetailAsync('user::hedbot');
            if (!portfolio) {
                yield this.portfolioService.createPortfolio({
                    type: 'user',
                    ownerId: 'test',
                    portfolioId: 'user::hedbot',
                });
            }
        });
    }
    setupTreasury() {
        return __awaiter(this, void 0, void 0, function* () {
            let portfolio = yield this.portfolioRepository.getDetailAsync('bank::treasury');
            if (!portfolio) {
                yield this.portfolioService.createPortfolio({
                    type: 'bank',
                    ownerId: 'test',
                    portfolioId: 'bank::treasury',
                });
            }
            yield this.transactionService.mintCoinsToPortfolio('bank::treasury', 1000000);
        });
    }
    fullBoot() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.bootstrap();
            yield Promise.all([this.setupTestAsset(), this.setupAccount()]);
        });
    }
    scrub() {
        return __awaiter(this, void 0, void 0, function* () {
            // scrub asset first. If do all in one promise, then they
            // may trample on one other so do assets and portfolios separately
            yield Promise.all([
                this.leagueService.scrubLeague('test'),
                this.leagueService.scrubLeague('mint'), // scrubs coin too
            ]);
            yield Promise.all([this.portfolioService.scrubPortfolio('user::hedbot')]);
        });
    }
    clearHoldings() {
        return __awaiter(this, void 0, void 0, function* () {
            // scrub asset holders first. If do all in one promise, then they
            // may trample on one other so do assets and portfolios separately
            yield Promise.all([
                this.portfolioHoldingsService.scrubAssetHolders('coin::fantx'),
                this.portfolioHoldingsService.scrubAssetHolders('card::jbone::test'),
            ]);
            yield Promise.all([
                this.portfolioHoldingsService.scrubPortfolioHoldings('user::hedbot'),
                this.portfolioHoldingsService.scrubPortfolioHoldings('league::mint'),
                this.portfolioHoldingsService.scrubPortfolioHoldings('league::test'),
            ]);
        });
    }
    clearDb() {
        return __awaiter(this, void 0, void 0, function* () {
            const targets = [
                'earners',
                'portfolios',
                'portfolioCache',
                'assets',
                'assetCache',
                'makers',
                'leagues',
                'transactions',
                'exchangeOrders',
                'exchangeTrades',
                'users',
            ];
            ////////////////////////////////////////////
            // ONLY CLEAR TEST DB
            ////////////////////////////////////////////
            let db = (0, getConnectionProps_1.getConnectionProps)();
            if (firebase.apps[0].options.databaseURL !== 'https://fantx-test.firebaseio.com') {
                throw new Error('Cannot clear non-test database');
            }
            const promises = [];
            targets.forEach((target) => {
                const entityRef = db.collection(target);
                promises.push((0, __1.deleteCollection)(entityRef));
            });
            yield Promise.all(promises);
        });
    }
}
exports.BootstrapService = BootstrapService;
