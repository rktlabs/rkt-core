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
exports.PortfolioAssetService = void 0;
const _1 = require(".");
const repositories_1 = require("../repositories");
/////////////////////////////
// Public Methods
/////////////////////////////
class PortfolioAssetService {
    constructor(db, eventPublisher) {
        this.db = db;
        this.eventPublisher = eventPublisher || new _1.EventPublisher();
        this.assetRepository = new repositories_1.AssetRepository(db);
        this.portfolioAssetRepository = new repositories_1.PortfolioAssetRepository(db);
        this.assetHolderRepository = new repositories_1.AssetHolderRepository(db);
        this.portfolioActivityRepository = new repositories_1.PortfolioActivityRepository(db);
    }
    newPortfolioAsset(portfolioId, assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const asset = yield this.assetRepository.getAsset(assetId);
            if (asset) {
                const assetDisplayName = asset.displayName || assetId;
                const entity = {
                    portfolioId: portfolioId,
                    assetId: assetId,
                    units: 0,
                    displayName: assetDisplayName,
                    net: 0,
                    cost: 0,
                };
                const cache = {
                    portfolioId: portfolioId,
                    assetId: assetId,
                    units: 0,
                };
                yield Promise.all([
                    this.portfolioAssetRepository.storePortfolioAsset(portfolioId, assetId, entity),
                    this.assetHolderRepository.storeAssetHolder(assetId, portfolioId, cache),
                ]);
                return entity;
            }
            else {
                return null;
            }
        });
    }
    proessTransaction(transactionId, updateSet, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.portfolioActivityRepository.atomicUpdateTransaction(transactionId, updateSet, transaction);
        });
    }
    scrubPortfolioAssets(portfolioId) {
        return __awaiter(this, void 0, void 0, function* () {
            const portfolioAssets = yield this.portfolioAssetRepository.listPortfolioAssets(portfolioId);
            const promises = [];
            portfolioAssets.forEach((portfolioAsset) => {
                const assetId = portfolioAsset.assetId;
                promises.push(this.portfolioAssetRepository.deletePortfolioAsset(portfolioId, assetId));
                promises.push(this.assetHolderRepository.deleteAssetHolder(assetId, portfolioId));
            });
            return Promise.all(promises);
        });
    }
    scrubAssetHolders(assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const assetHolders = yield this.assetHolderRepository.listAssetHolders(assetId);
            const promises = [];
            assetHolders.forEach((holder) => {
                const portfolioId = holder.portfolioId;
                promises.push(this.assetHolderRepository.deleteAssetHolder(assetId, portfolioId));
                promises.push(this.portfolioAssetRepository.deletePortfolioAsset(portfolioId, assetId));
            });
            return Promise.all(promises);
        });
    }
    scrubPortfolioAsset(portfolioId, assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const promises = [
                this.assetHolderRepository.deleteAssetHolder(assetId, portfolioId),
                this.portfolioAssetRepository.deletePortfolioAsset(portfolioId, assetId),
            ];
            return Promise.all(promises);
        });
    }
    getPortfolioAssetBalance(portfolioId, assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const par = yield this.portfolioAssetRepository.getPortfolioAsset(portfolioId, assetId);
            if (!par) {
                return 0;
            }
            else {
                return par.units;
            }
        });
    }
}
exports.PortfolioAssetService = PortfolioAssetService;
