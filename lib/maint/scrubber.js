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
exports.Scrubber = void 0;
const log4js = require("log4js");
const __1 = require("..");
const getConnectionProps_1 = require("../repositories/getConnectionProps");
const logger = log4js.getLogger('Scrubber');
class Scrubber {
    constructor(repos = {}) {
        this.transactionRepository = new __1.TransactionRepository();
        this.marketMakerRepository = new __1.MarketMakerRepository();
        this.leagueRepository = new __1.LeagueRepository();
        this.assetHolderRepository = new __1.AssetHolderRepository();
        this.portfolioHoldingRepository = new __1.PortfolioHoldingRepository();
        this.db = (0, getConnectionProps_1.getConnectionProps)();
        this.assetRepository = repos.assetRepository || new __1.AssetRepository();
        this.portfolioRepository = repos.portfolioRepository || new __1.PortfolioRepository();
        this.userRepository = repos.userRepository || new __1.UserRepository();
    }
    // activityRepository = new ActivityRepository()
    static scrub() {
        return __awaiter(this, void 0, void 0, function* () {
            const scrubber = new Scrubber();
            logger.trace('-----scrub start----------');
            const saveLoggerLevel = log4js.getLogger().level;
            log4js.getLogger().level = 'error';
            yield scrubber.scrub();
            log4js.getLogger().level = saveLoggerLevel;
            logger.trace('-----scrub finished--------------');
        });
    }
    scrubTransactionCollectionAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            const entityRef = this.db.collection('transactions');
            yield (0, __1.deleteCollection)(entityRef);
        });
    }
    // TODO: scrub portfolio activity
    // TODO; scrub asset activity
    // async scrubPortfolioActivityCollectionAsync(portfolioId: string) {
    //     const entityRef = this.db.collection('portfolios').doc(portfolioId).collection('activity')
    //     await deleteCollection(entityRef)
    // }
    scrubPortfolioDepositsAsync(portfolioId) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityRef = this.db.collection('portfolios').doc(portfolioId).collection('funding');
            yield (0, __1.deleteCollection)(entityRef);
        });
    }
    scrubExchangeOrderCollectionAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            const entityRef = this.db.collection('exchangeOrders');
            yield (0, __1.deleteCollection)(entityRef);
        });
    }
    scrubExchangeTradeCollectionAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            const entityRef = this.db.collection('exchangeTrades');
            yield (0, __1.deleteCollection)(entityRef);
        });
    }
    scrubAssetHolders(assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const assetHolders = yield this.assetHolderRepository.getListAsync(assetId);
            const promises = [];
            assetHolders.forEach((holder) => {
                const portfolioId = holder.portfolioId;
                promises.push(this.assetHolderRepository.deleteAsync(assetId, portfolioId));
                promises.push(this.portfolioHoldingRepository.deleteAsync(portfolioId, assetId));
            });
            yield Promise.all(promises);
        });
    }
    scrubMarketMaker(assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const portfolioId = `maker::${assetId}`;
            yield this.scrubPortfolio(portfolioId);
            yield this.marketMakerRepository.deleteAsync(assetId);
        });
    }
    scrubAsset(assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.scrubAssetHolders(assetId);
            yield this.scrubPortfolio(`asset::${assetId}`);
            yield this.scrubMarketMaker(assetId);
            yield this.assetRepository.deleteAsync(assetId);
        });
    }
    scrubLeague(leagueId) {
        return __awaiter(this, void 0, void 0, function* () {
            // scrub all of the owned assets
            const managedAssetIds = yield this.assetRepository.getLeagueAssetsAsync(leagueId);
            const promises = [];
            managedAssetIds.forEach((asset) => {
                promises.push(this.scrubLeagueAsset(asset.assetId));
            });
            yield Promise.all(promises);
            // scrub the associated portfolio
            const portfolioId = `league::${leagueId}`;
            yield this.scrubPortfolio(portfolioId);
            yield this.leagueRepository.deleteAsync(leagueId);
        });
    }
    scrubLeagueAsset(assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.scrubAsset(assetId);
        });
    }
    scrubPortfolio(portfolioId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.scrubPortfolioHoldings(portfolioId);
            //await this.scrubPortfolioActivityCollectionAsync(portfolioId)
            yield this.scrubPortfolioDepositsAsync(portfolioId);
            yield this.portfolioRepository.deleteAsync(portfolioId);
        });
    }
    scrubUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.scrubPortfolio(`user::${userId}`);
            yield this.userRepository.deleteAsync(userId);
        });
    }
    scrubPortfolioHoldings(portfolioId) {
        return __awaiter(this, void 0, void 0, function* () {
            const portfolioHoldings = yield this.portfolioHoldingRepository.getListAsync(portfolioId);
            const promises = [];
            portfolioHoldings.forEach((portfolioHoldings) => {
                const assetId = portfolioHoldings.assetId;
                promises.push(this.portfolioHoldingRepository.deleteAsync(portfolioId, assetId));
                promises.push(this.assetHolderRepository.deleteAsync(assetId, portfolioId));
            });
            yield Promise.all(promises);
        });
    }
    scrubRkt() {
        return __awaiter(this, void 0, void 0, function* () {
            const assetId = 'coin::rkt';
            yield this.scrubAsset(assetId);
        });
    }
    scrubBank() {
        return __awaiter(this, void 0, void 0, function* () {
            const treasuryId = 'bank::treasury';
            const mintId = 'bank::mint';
            yield this.scrubPortfolio(treasuryId);
            yield this.scrubPortfolio(mintId);
        });
    }
    scrubLeague2() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.scrubLeague('test');
        });
    }
    scrubUser2() {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = 'testbot';
            yield this.scrubUser(userId);
        });
    }
    scrubAsset2(assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.scrubAsset2(assetId);
        });
    }
    scrubAssets() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.scrubAsset2('card::testehed');
            yield this.scrubAsset2('card::testjhed');
        });
    }
    scrub() {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all([
                this.scrubRkt(),
                this.scrubBank(),
                this.scrubUser2(),
                this.scrubLeague2(),
                this.scrubAssets(),
            ]);
        });
    }
}
exports.Scrubber = Scrubber;
