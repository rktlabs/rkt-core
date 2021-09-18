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
exports.AssetHolderService = void 0;
const __1 = require("..");
/////////////////////////////
// Public Methods
/////////////////////////////
class AssetHolderService {
    constructor() {
        this.assetRepository = new __1.AssetRepository();
        this.portfolioHoldingRepository = new __1.PortfolioHoldingRepository();
        this.assetHolderRepository = new __1.AssetHolderRepository();
        this.portfolioActivityRepository = new __1.PortfolioActivityRepository();
    }
    addAssetHolder(portfolioId, assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const asset = yield this.assetRepository.getDetailAsync(assetId);
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
                const assetHolder = {
                    portfolioId: portfolioId,
                    assetId: assetId,
                    units: 0,
                };
                yield Promise.all([
                    this.portfolioHoldingRepository.storeAsync(portfolioId, assetId, entity),
                    this.assetHolderRepository.storeAsync(assetId, portfolioId, assetHolder),
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
            return this.portfolioActivityRepository.atomicUpdateTransactionAsync(transactionId, updateSet, transaction);
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
            return Promise.all(promises);
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
            return Promise.all(promises);
        });
    }
    deleteAssetHolder(assetId, portfolioId) {
        return __awaiter(this, void 0, void 0, function* () {
            const promises = [
                this.assetHolderRepository.deleteAsync(assetId, portfolioId),
                this.portfolioHoldingRepository.deleteAsync(portfolioId, assetId),
            ];
            return Promise.all(promises);
        });
    }
    deletePortfolioHolding(portfolioId, assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const promises = [
                this.assetHolderRepository.deleteAsync(assetId, portfolioId),
                this.portfolioHoldingRepository.deleteAsync(portfolioId, assetId),
            ];
            return Promise.all(promises);
        });
    }
    getAssetHoldingTotal(assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const holders = yield this.assetHolderRepository.getListAsync(assetId);
            const total = holders.reduce((acc, deposit) => {
                return acc + deposit.units;
            }, 0);
            return total;
        });
    }
    getPortfolioHoldingBalance(portfolioId, assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const portfolioHolding = yield this.portfolioHoldingRepository.getDetailAsync(portfolioId, assetId);
            if (!portfolioHolding) {
                return 0;
            }
            else {
                return portfolioHolding.units;
            }
        });
    }
}
exports.AssetHolderService = AssetHolderService;
