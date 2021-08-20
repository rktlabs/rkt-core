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
// lint:disable: no-console
const caches_1 = require("../caches");
const makers_1 = require("makers");
const services_1 = require("../services");
const makers_2 = require("makers");
const errors_1 = require("../errors");
class MakerService {
    constructor(db, eventPublisher) {
        this.makerRepository = new makers_1.MakerRepository(db);
        this.portfolioCache = new caches_1.PortfolioCache(db);
        this.portfolioService = new services_1.PortfolioService(db, eventPublisher);
        this.makerServiceFactory = new makers_2.MakerServiceFactory(db);
    }
    newMaker(payload, shouldCreatePortfolio = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const assetId = payload.assetId;
            payload.assetId = assetId;
            if (assetId) {
                const maker = yield this.makerRepository.getMaker(assetId);
                if (maker) {
                    const msg = `Maker Creation Failed - assetId: ${assetId} already exists`;
                    throw new errors_1.DuplicateError(msg, { assetId });
                }
                // check for existence of maker portfolio (shouldn't exist if maker doesn't exist)
                if (shouldCreatePortfolio) {
                    const portfolioId = `maker::${assetId}`;
                    const portfolio = yield this.portfolioCache.lookupPortfolio(portfolioId);
                    if (portfolio) {
                        const msg = `Maker Creation Failed - portfolioId: ${portfolioId} already exists`;
                        throw new errors_1.ConflictError(msg, { portfolioId });
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
            const maker = yield this.makerRepository.getMaker(assetId);
            if (maker) {
                const portfolioId = maker.portfolioId;
                yield this.makerRepository.deleteMaker(assetId);
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
            yield this.makerRepository.deleteMaker(assetId);
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
            const maker = makers_2.Maker.newMaker(newProps);
            if (shouldCreatePortfolio) {
                const portfolioId = yield this.createMakerPortfolioImpl(maker);
                maker.portfolioId = portfolioId;
            }
            yield this.makerRepository.storeMaker(maker);
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
