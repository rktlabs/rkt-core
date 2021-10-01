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
const log4js = require("log4js");
const __1 = require("..");
const logger = log4js.getLogger('AssetHolderService');
/////////////////////////////
// Public Methods
/////////////////////////////
class AssetHolderService {
    constructor(assetRepository) {
        this.assetRepository = assetRepository;
        this.assetHolderRepository = new __1.AssetHolderRepository();
        this.portfolioHoldingRepository = new __1.PortfolioHoldingRepository();
        this.activityRepository = new __1.ActivityRepository();
    }
    createAssetHolder(assetId, portfolioId) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.trace(`addAssetHolder(${assetId}, ${portfolioId})`);
            const asset = yield this.assetRepository.getDetailAsync(assetId);
            if (asset) {
                const assetDisplayName = asset.displayName || assetId;
                const portfolioHolding = {
                    portfolioId: portfolioId,
                    assetId: assetId,
                    units: 0,
                    displayName: assetDisplayName,
                };
                const assetHolder = {
                    portfolioId: portfolioId,
                    assetId: assetId,
                    units: 0,
                };
                yield Promise.all([
                    this.portfolioHoldingRepository.storeAsync(portfolioId, assetId, portfolioHolding),
                    this.assetHolderRepository.storeAsync(assetId, portfolioId, assetHolder),
                ]);
                return portfolioHolding;
            }
            else {
                return null;
            }
        });
    }
    proessTransaction(updateSet, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.activityRepository.atomicUpdateTransactionAsync(updateSet, transaction);
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
    getAssetHoldingTotal(assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const holders = yield this.assetHolderRepository.getListAsync(assetId);
            const total = holders.reduce((acc, deposit) => {
                return acc + deposit.units;
            }, 0);
            return total;
        });
    }
    getAssetHolderBalance(assetId, portfolioId) {
        return __awaiter(this, void 0, void 0, function* () {
            const assetHolder = yield this.assetHolderRepository.getDetailAsync(assetId, portfolioId);
            if (!assetHolder) {
                return 0;
            }
            else {
                return assetHolder.units;
            }
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
