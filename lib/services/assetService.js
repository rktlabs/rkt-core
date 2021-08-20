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
const caches_1 = require("../caches");
const repositories_1 = require("../repositories");
const models_1 = require("../models");
const errors_1 = require("../errors");
const services_1 = require("../services");
class AssetService {
    constructor(db, eventPublisher) {
        this.eventPublisher = eventPublisher || new services_1.EventPublisher();
        this.assetRepository = new repositories_1.AssetRepository(db);
        this.portfolioCache = new caches_1.PortfolioCache(db);
        this.assetCache = new caches_1.AssetCache(db);
        this.portfolioAssetService = new services_1.PortfolioAssetService(db, eventPublisher);
        this.portfolioService = new services_1.PortfolioService(db, eventPublisher);
    }
    newAsset(payload, shouldCreatePortfolio = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const assetId = payload.symbol;
            if (assetId) {
                const asset = yield this.assetCache.lookupAsset(assetId);
                if (asset) {
                    const msg = `Asset Creation Failed - assetId: ${assetId} already exists`;
                    throw new errors_1.DuplicateError(msg, { assetId });
                }
                // check for existence of asset portfolio (shouldn't exist if asset doesn't exist)
                if (shouldCreatePortfolio) {
                    const portfolioId = `asset::${assetId}`;
                    if (portfolioId) {
                        const portfolio = yield this.portfolioCache.lookupPortfolio(portfolioId);
                        if (portfolio) {
                            const msg = `Asset Creation Failed - portfolioId: ${portfolioId} already exists`;
                            throw new errors_1.ConflictError(msg, { portfolioId });
                        }
                    }
                }
            }
            const asset = yield this.createAssetImpl(payload, shouldCreatePortfolio);
            // if (this.eventPublisher) {
            //     await this.eventPublisher.publishAssetCreateAsync(asset, 'assetService')
            // }
            return asset;
        });
    }
    deleteAsset(assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.portfolioAssetService.scrubAssetHolders(assetId);
            const asset = yield this.assetCache.lookupAsset(assetId);
            if (asset) {
                const portfolioId = asset.portfolioId;
                yield this.assetRepository.deleteAsset(assetId);
                if (portfolioId) {
                    yield this.portfolioService.deletePortfolio(portfolioId);
                }
            }
        });
    }
    scrubAsset(assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.portfolioAssetService.scrubAssetHolders(assetId);
            yield this.portfolioService.scrubPortfolio(`asset::${assetId}`);
            yield this.assetRepository.deleteAsset(assetId);
        });
    }
    ///////////////////////////////////////////
    // Private Methods
    ///////////////////////////////////////////
    createAssetImpl(payload, shouldCreatePortfolio) {
        return __awaiter(this, void 0, void 0, function* () {
            const assetDisplayName = payload.displayName;
            const asset = models_1.Asset.newAsset(payload);
            if (shouldCreatePortfolio) {
                const portfolioId = yield this.createAssetPortfolioImpl(asset, `${assetDisplayName} value portfolio`);
                asset.portfolioId = portfolioId;
            }
            yield this.assetRepository.storeAsset(asset);
            // if (this.eventPublisher) {
            //     await this.eventPublisher.publishAssetNewEventAsync(asset, 'assetService')
            // }
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
            const portfolio = yield this.portfolioService.newPortfolio(assetPortfolioDef);
            return portfolio.portfolioId;
        });
    }
}
exports.AssetService = AssetService;
