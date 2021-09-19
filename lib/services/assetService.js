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
exports.AssetService = void 0;
const _1 = require(".");
const __1 = require("..");
class AssetService {
    constructor() {
        this.assetRepository = new __1.AssetRepository();
        this.portfolioRepository = new __1.PortfolioRepository();
        this.assetHolderService = new _1.AssetHolderService();
        this.portfolioService = new _1.PortfolioService();
        this.makerService = new _1.MakerService();
    }
    createAsset(payload, shouldCreatePortfolio = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const assetId = payload.symbol;
            if (assetId) {
                const asset = yield this.assetRepository.getDetailAsync(assetId);
                if (asset) {
                    const msg = `Asset Creation Failed - assetId: ${assetId} already exists`;
                    throw new __1.DuplicateError(msg, { assetId });
                }
                // check for existence of asset portfolio (shouldn't exist if asset doesn't exist)
                if (shouldCreatePortfolio) {
                    const portfolioId = `asset::${assetId}`;
                    if (portfolioId) {
                        const portfolio = yield this.portfolioRepository.getDetailAsync(portfolioId);
                        if (portfolio) {
                            const msg = `Asset Creation Failed - portfolioId: ${portfolioId} already exists`;
                            throw new __1.ConflictError(msg, { portfolioId });
                        }
                    }
                }
            }
            const asset = yield this.createAssetImpl(payload, shouldCreatePortfolio);
            return asset;
        });
    }
    deleteAsset(assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.scrubAsset(assetId);
        });
    }
    scrubAsset(assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.assetHolderService.scrubAssetHolders(assetId);
            yield this.portfolioService.scrubPortfolio(`asset::${assetId}`);
            yield this.makerService.scrubMaker(assetId);
            yield this.assetRepository.deleteAsync(assetId);
        });
    }
    ////////////////////////////////////////////////////////
    // PRIVATE
    ////////////////////////////////////////////////////////
    createAssetImpl(payload, shouldCreatePortfolio) {
        return __awaiter(this, void 0, void 0, function* () {
            const assetDisplayName = payload.displayName;
            const asset = __1.Asset.newAsset(payload);
            if (shouldCreatePortfolio) {
                const portfolioId = yield this.createAssetPortfolioImpl(asset, `${assetDisplayName} value portfolio`);
                asset.portfolioId = portfolioId;
            }
            yield this.assetRepository.storeAsync(asset);
            return asset;
        });
    }
    createAssetPortfolioImpl(asset, displayName) {
        return __awaiter(this, void 0, void 0, function* () {
            const assetPortfolioDef = {
                type: 'asset',
                portfolioId: `asset::${asset.assetId}`,
                ownerId: asset.ownerId,
                displayName: `${displayName}`,
                tags: {
                    source: 'ASSET_CREATION',
                },
            };
            const portfolio = yield this.portfolioService.createPortfolio(assetPortfolioDef);
            return portfolio.portfolioId;
        });
    }
}
exports.AssetService = AssetService;
