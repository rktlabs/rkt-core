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
exports.MakerService = void 0;
const _1 = require(".");
const __1 = require("..");
const maker_1 = require("../models/maker");
class MakerService {
    constructor() {
        this.assetRepository = new __1.AssetRepository();
        this.makerRepository = new __1.MakerRepository();
        this.portfolioCache = new __1.PortfolioRepository();
        this.portfolioService = new _1.PortfolioService();
        this.makerServiceFactory = new _1.MakerServiceFactory();
    }
    newMaker(payload, shouldCreatePortfolio = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const assetId = payload.assetId;
            payload.assetId = assetId;
            if (assetId) {
                const maker = yield this.makerRepository.getDetailAsync(assetId);
                if (maker) {
                    const msg = `Maker Creation Failed - assetId: ${assetId} already exists`;
                    throw new __1.DuplicateError(msg, { assetId });
                }
                // check for existence of maker portfolio (shouldn't exist if maker doesn't exist)
                if (shouldCreatePortfolio) {
                    const portfolioId = `maker::${assetId}`;
                    const portfolio = yield this.portfolioCache.getDetailAsync(portfolioId);
                    if (portfolio) {
                        const msg = `Maker Creation Failed - portfolioId: ${portfolioId} already exists`;
                        throw new __1.ConflictError(msg, { portfolioId });
                    }
                }
            }
            // if (payload.initialUnits || payload.initialCoins) {
            //     // check for existence of registry
            //     const treasuryPortfolioId = 'contract::mint'
            //     const treasuryPortfolio = await this.portfolioCache.lookupPortfolio(treasuryPortfolioId)
            //     if (!treasuryPortfolio) {
            //         const msg = `Maker Creation Failed - treasury portfolioId: ${treasuryPortfolioId} does not exist`
            //         throw new ConflictError(msg, { portfolioId: treasuryPortfolioId })
            //     }
            // }
            const maker = yield this.createMakerImpl(payload, shouldCreatePortfolio);
            // if (payload.initialUnits) {
            //     await this.loadAssetUnits(maker, payload.initialUnits)
            // }
            // if (payload.initialCoins) {
            //     await this.loadTreasuryCoins(maker, payload.initialCoins)
            // }
            return maker;
        });
    }
    deleteMaker(assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            // {
            //     // check for linked assets
            //     const entityRefCollection = this.db.collection('assets').where('assetId', '==', assetId)
            //     const entityCollectionRefs = await entityRefCollection.get()
            //     if (entityCollectionRefs.size > 0) {
            //         const assetIds = entityCollectionRefs.docs.map((doc) => {
            //             const data = doc.data()
            //             return data.assetId
            //         })
            //         const assetIdList = assetIds.join(', ')
            //         throw new ConflictError(`Portfolio in use: ${assetIdList}`)
            //     }
            // }
            let asset = yield this.assetRepository.getDetailAsync(assetId);
            if (asset) {
                throw new __1.ConflictError(`Cannot Delete Portfolio. Asset Portfolio in use: ${assetId}`);
            }
            const maker = yield this.makerRepository.getDetailAsync(assetId);
            if (maker) {
                const portfolioId = maker.portfolioId;
                yield this.makerRepository.deleteAsync(assetId);
                if (portfolioId) {
                    yield this.portfolioService.deletePortfolio(portfolioId);
                }
            }
        });
    }
    scrubMaker(assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const portfolioId = `maker::${assetId}`;
            yield this.portfolioService.scrubPortfolio(portfolioId);
            yield this.makerRepository.deleteAsync(assetId);
        });
    }
    ///////////////////////////////////////////
    // Private Methods
    ///////////////////////////////////////////
    createMakerImpl(payload, shouldCreatePortfolio) {
        return __awaiter(this, void 0, void 0, function* () {
            // EJH: Init from typed maker as necessary *******
            //const config = this.makerFactory.initializeParams(payload)
            const config = payload;
            const newProps = this.makerServiceFactory.initializeParams(payload);
            const maker = maker_1.Maker.newMaker(newProps);
            if (shouldCreatePortfolio) {
                const portfolioId = yield this.createMakerPortfolioImpl(maker);
                maker.portfolioId = portfolioId;
            }
            yield this.makerRepository.storeAsync(maker);
            return maker;
        });
    }
    createMakerPortfolioImpl(maker) {
        return __awaiter(this, void 0, void 0, function* () {
            const makerPortfolioDef = {
                type: 'maker',
                portfolioId: `maker::${maker.assetId}`,
                ownerId: maker.ownerId,
                displayName: maker.assetId,
                tags: {
                    source: 'ASSET_CREATION',
                },
            };
            const portfolio = yield this.portfolioService.newPortfolio(makerPortfolioDef);
            return portfolio.portfolioId;
        });
    }
}
exports.MakerService = MakerService;
