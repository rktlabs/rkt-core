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
const services_1 = require("../services");
const __1 = require("..");
const log4js = require("log4js");
const logger = log4js.getLogger('assetService');
class AssetService {
    constructor(assetRepository, portfolioRepository, marketMakerRepository, transactionRepository) {
        this.assetRepository = assetRepository;
        this.portfolioRepository = portfolioRepository;
        this.assetHolderService = new services_1.AssetHolderService(this.assetRepository);
        this.portfolioService = new __1.PortfolioService(portfolioRepository);
        this.marketMakerService = new services_1.MarketMakerService(assetRepository, portfolioRepository, transactionRepository, marketMakerRepository);
    }
    createAsset(payload, shouldCreatePortfolio = true) {
        return __awaiter(this, void 0, void 0, function* () {
            //logger.trace("start createAsset", payload)
            const assetId = payload.symbol;
            if (assetId) {
                const asset = yield this.assetRepository.getDetailAsync(assetId);
                if (asset) {
                    const msg = `Asset Creation Failed - assetId: ${assetId} already exists`;
                    logger.error(msg);
                    throw new __1.DuplicateError(msg, { assetId });
                }
                // check for existence of asset portfolio (shouldn't exist if asset doesn't exist)
                if (shouldCreatePortfolio) {
                    const portfolioId = `asset::${assetId}`;
                    if (portfolioId) {
                        const portfolio = yield this.portfolioRepository.getDetailAsync(portfolioId);
                        if (portfolio) {
                            const msg = `Asset Creation Failed - portfolioId: ${portfolioId} already exists`;
                            logger.error(msg);
                            throw new __1.ConflictError(msg, { portfolioId });
                        }
                    }
                }
            }
            const asset = yield this._createAssetImpl(payload, shouldCreatePortfolio);
            logger.trace(`created asset: ${asset.assetId}`);
            return asset;
        });
    }
    deleteAsset(assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.trace(`delete asset: ${assetId}`);
            yield this.scrubAsset(assetId);
        });
    }
    scrubAsset(assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            //logger.trace(`***scrubbing assetHolders ${assetId}`)
            yield this.assetHolderService.scrubAssetHolders(assetId);
            //logger.trace(`***scrubbing asset portfolio asset::${assetId}`)
            yield this.portfolioService.scrubPortfolio(`asset::${assetId}`);
            //logger.trace(`***scrubbing marketMaker ${assetId}`)
            yield this.marketMakerService.scrubMarketMaker(assetId);
            //logger.trace(`***scrubbing asset ${assetId}`)
            yield this.assetRepository.deleteAsync(assetId);
            //logger.trace(`***done scrubbing asset`)
        });
    }
    ////////////////////////////////////////////////////////
    // PRIVATE
    ////////////////////////////////////////////////////////
    _createAssetImpl(payload, shouldCreatePortfolio) {
        return __awaiter(this, void 0, void 0, function* () {
            const assetDisplayName = payload.displayName;
            const asset = __1.Asset.newAsset(payload);
            if (shouldCreatePortfolio) {
                const portfolioId = yield this._createAssetPortfolioImpl(asset, `${assetDisplayName} value portfolio`);
                asset.portfolioId = portfolioId;
            }
            yield this.assetRepository.storeAsync(asset);
            return asset;
        });
    }
    _createAssetPortfolioImpl(asset, displayName) {
        return __awaiter(this, void 0, void 0, function* () {
            const assetPortfolioDef = {
                type: 'asset',
                portfolioId: `asset::${asset.assetId}`,
                ownerId: asset.ownerId,
                displayName: `${displayName}`,
            };
            const portfolio = yield this.portfolioService.createPortfolio(assetPortfolioDef);
            return portfolio.portfolioId;
        });
    }
}
exports.AssetService = AssetService;
