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
const __1 = require("..");
class BootstrapService {
    constructor(eventPublisher) {
        this.assetRepository = new __1.AssetRepository();
        this.portfolioRepository = new __1.PortfolioRepository();
        this.assetService = new __1.AssetService();
        this.portfolioService = new __1.PortfolioService();
        this.portfolioHoldingService = new __1.PortfolioHoldingService();
        this.leagueService = new __1.LeagueService();
        this.transactionService = new __1.TransactionService(eventPublisher);
    }
    // bootstrap the system with the "rkt" coin
    createRkt() {
        return __awaiter(this, void 0, void 0, function* () {
            const assetId = 'coin::rkt';
            const assetDef = {
                ownerId: 'test',
                symbol: assetId,
                displayName: assetId,
            };
            yield this.assetService.createAsset(assetDef);
        });
    }
    bootTestLeague() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.leagueService.createLeague({
                ownerId: 'test',
                leagueId: 'test',
            });
        });
    }
    bootstrap() {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all([this.createRkt(), this.bootTestLeague()]);
        });
    }
    setupTestAsset() {
        return __awaiter(this, void 0, void 0, function* () {
            const leagueId = 'test';
            const assetId = 'card::jbone';
            let asset = yield this.assetRepository.getDetailAsync(assetId);
            if (!asset) {
                yield this.leagueService.createAsset(leagueId, {
                    symbol: assetId,
                    displayName: assetId,
                });
            }
        });
    }
    setupAccount() {
        return __awaiter(this, void 0, void 0, function* () {
            let portfolio = yield this.portfolioRepository.getDetailAsync('user::hedbot');
            if (!portfolio) {
                yield this.portfolioService.createOrKeepPortfolio({
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
                yield this.portfolioService.createOrKeepPortfolio({
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
    fullScrub() {
        return __awaiter(this, void 0, void 0, function* () {
            // scrub asset first. If do all in one promise, then they
            // may trample on one other so do assets and portfolios separately
            yield Promise.all([
                this.leagueService.scrubLeague('test'),
                this.assetService.scrubAsset('coin::rkt'), // scrubs coin too
            ]);
            yield Promise.all([this.portfolioService.scrubPortfolio('user::hedbot')]);
        });
    }
    clearHoldings() {
        return __awaiter(this, void 0, void 0, function* () {
            // scrub asset holders first. If do all in one promise, then they
            // may trample on one other so do assets and portfolios separately
            yield Promise.all([
                this.portfolioHoldingService.scrubAssetHolders('coin::rkt'),
                this.portfolioHoldingService.scrubAssetHolders('card::jbone::test'),
            ]);
            yield Promise.all([
                this.portfolioHoldingService.scrubPortfolioHoldings('user::hedbot'),
                this.portfolioHoldingService.scrubPortfolioHoldings('league::test'),
            ]);
        });
    }
}
exports.BootstrapService = BootstrapService;
