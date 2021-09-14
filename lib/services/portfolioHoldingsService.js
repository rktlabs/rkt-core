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
exports.PortfolioHoldingsService = void 0;
const __1 = require("..");
/////////////////////////////
// Public Methods
/////////////////////////////
class PortfolioHoldingsService {
    constructor() {
        this.assetRepository = new __1.AssetRepository();
        this.portfolioHoldingsRepository = new __1.PortfolioHoldingsRepository();
        this.assetHoldersRepository = new __1.AssetHoldersRepository();
        this.portfolioActivityRepository = new __1.PortfolioActivityRepository();
    }
    newPortfolioHolding(portfolioId, assetId) {
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
                const cache = {
                    portfolioId: portfolioId,
                    assetId: assetId,
                    units: 0,
                };
                yield Promise.all([
                    this.portfolioHoldingsRepository.storeAsync(portfolioId, assetId, entity),
                    this.assetHoldersRepository.storeAsync(assetId, portfolioId, cache),
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
            const portfolioHoldingss = yield this.portfolioHoldingsRepository.getListAsync(portfolioId);
            const promises = [];
            portfolioHoldingss.forEach((portfolioHoldings) => {
                const assetId = portfolioHoldings.assetId;
                promises.push(this.portfolioHoldingsRepository.deleteAsync(portfolioId, assetId));
                promises.push(this.assetHoldersRepository.deleteAsync(assetId, portfolioId));
            });
            return Promise.all(promises);
        });
    }
    scrubAssetHolders(assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const assetHolders = yield this.assetHoldersRepository.getListAsync(assetId);
            const promises = [];
            assetHolders.forEach((holder) => {
                const portfolioId = holder.portfolioId;
                promises.push(this.assetHoldersRepository.deleteAsync(assetId, portfolioId));
                promises.push(this.portfolioHoldingsRepository.deleteAsync(portfolioId, assetId));
            });
            return Promise.all(promises);
        });
    }
    deletePortfolioHolding(portfolioId, assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const promises = [
                this.assetHoldersRepository.deleteAsync(assetId, portfolioId),
                this.portfolioHoldingsRepository.deleteAsync(portfolioId, assetId),
            ];
            return Promise.all(promises);
        });
    }
    getPortfolioHoldingBalance(portfolioId, assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const par = yield this.portfolioHoldingsRepository.getDetailAsync(portfolioId, assetId);
            if (!par) {
                return 0;
            }
            else {
                return par.units;
            }
        });
    }
}
exports.PortfolioHoldingsService = PortfolioHoldingsService;
