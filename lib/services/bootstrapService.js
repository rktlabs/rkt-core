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
const repositories_1 = require("../repositories");
const services_1 = require("../services");
const deleters_1 = require("../util/deleters");
const firebase = require("firebase-admin");
class BootstrapService {
    constructor(db, eventPublisher) {
        this.db = db;
        this.assetRepository = new repositories_1.AssetRepository(db);
        this.earnerRepository = new repositories_1.EarnerRepository(db);
        this.portfolioRepository = new repositories_1.PortfolioRepository(db);
        this.earnerService = new services_1.EarnerService(db, eventPublisher);
        this.portfolioService = new services_1.PortfolioService(db, eventPublisher);
        this.portfolioAssetService = new services_1.PortfolioAssetService(db, eventPublisher);
        this.contractService = new services_1.ContractService(db, eventPublisher);
        this.transactionService = new services_1.TransactionService(db, eventPublisher);
    }
    // bootstrap the system with the "mint" contract and the "coin" asset
    bootMint() {
        return __awaiter(this, void 0, void 0, function* () {
            const mintContract = yield this.contractService.newContract({
                ownerId: 'system',
                contractId: 'mint',
            });
            yield this.contractService.newSimpleAsset(mintContract, 'coin', 'fantx');
        });
    }
    bootTestContract() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.contractService.newContract({
                ownerId: 'test',
                contractId: 'test',
            });
        });
    }
    bootstrap() {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all([this.bootMint(), this.bootTestContract()]);
        });
    }
    setupTestAsset() {
        return __awaiter(this, void 0, void 0, function* () {
            const contractId = 'test';
            const earnerId = 'card::jbone';
            let earner = yield this.earnerRepository.getEarner(earnerId);
            if (!earner) {
                earner = yield this.earnerService.newEarner({
                    ownerId: 'tester',
                    symbol: earnerId,
                    displayName: 'Jbone Genie',
                });
            }
            const assetId = `${earnerId}::${contractId}`;
            let asset = yield this.assetRepository.getAsset(assetId);
            if (!asset) {
                yield this.contractService.newAsset(contractId, {
                    earnerId: earnerId,
                    initialPrice: 11,
                    displayName: earner.displayName,
                });
            }
        });
    }
    setupAccount() {
        return __awaiter(this, void 0, void 0, function* () {
            let portfolio = yield this.portfolioRepository.getPortfolio('user::hedbot');
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
            let portfolio = yield this.portfolioRepository.getPortfolio('bank::treasury');
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
                this.contractService.scrubContract('test'),
                this.contractService.scrubContract('mint'), // scrubs coin too
            ]);
            yield Promise.all([this.portfolioService.scrubPortfolio('user::hedbot')]);
        });
    }
    clearHoldings() {
        return __awaiter(this, void 0, void 0, function* () {
            // scrub asset holders first. If do all in one promise, then they
            // may trample on one other so do assets and portfolios separately
            yield Promise.all([
                this.portfolioAssetService.scrubAssetHolders('coin::fantx'),
                this.portfolioAssetService.scrubAssetHolders('card::jbone::test'),
            ]);
            yield Promise.all([
                this.portfolioAssetService.scrubPortfolioAssets('user::hedbot'),
                this.portfolioAssetService.scrubPortfolioAssets('contract::mint'),
                this.portfolioAssetService.scrubPortfolioAssets('contract::test'),
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
                'contracts',
                'transactions',
                'exchangeOrders',
                'exchangeTrades',
                'users',
            ];
            ////////////////////////////////////////////
            // ONLY CLEAR TEST DB
            ////////////////////////////////////////////
            if (firebase.apps[0].options.databaseURL !== 'https://fantx-test.firebaseio.com') {
                throw new Error('Cannot clear non-test database');
            }
            const promises = [];
            targets.forEach((target) => {
                const entityRef = this.db.collection(target);
                promises.push(deleters_1.deleteCollection(entityRef));
            });
            yield Promise.all(promises);
        });
    }
}
exports.BootstrapService = BootstrapService;
