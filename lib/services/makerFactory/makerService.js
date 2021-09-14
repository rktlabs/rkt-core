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
const __1 = require("..");
const __2 = require("../..");
const makers_1 = require("./makers");
class MakerService {
    constructor() {
        this.assetRepository = new __2.AssetRepository();
        this.makerRepository = new __2.MakerRepository();
        this.portfolioRepository = new __2.PortfolioRepository();
        this.portfolioService = new __1.PortfolioService();
    }
    getMakerAsync(assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const makerDef = yield this.makerRepository.getDetailAsync(assetId);
            if (makerDef == null) {
                return null;
            }
            const makerType = makerDef.type;
            let maker = null;
            switch (makerType) {
                case 'constantk':
                    maker = new makers_1.KMaker(makerDef);
                    break;
                case 'bondingmaker1':
                    maker = new makers_1.Bonding1Maker(makerDef);
                    break;
                case 'bondingmaker2':
                    maker = new makers_1.Bonding2Maker(makerDef);
                    break;
                case 'logisticmaker1':
                    maker = new makers_1.LogarithmicMaker(makerDef);
                    break;
                default:
                    maker = new makers_1.KMaker(makerDef);
                    break;
            }
            return maker;
        });
    }
    newMaker(payload, shouldCreatePortfolio = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const assetId = payload.assetId;
            if (assetId) {
                const maker = yield this.makerRepository.getDetailAsync(assetId);
                if (maker) {
                    const msg = `Maker Creation Failed - assetId: ${assetId} already exists`;
                    throw new __2.DuplicateError(msg, { assetId });
                }
                // check for existence of maker portfolio (shouldn't exist if maker doesn't exist)
                if (shouldCreatePortfolio) {
                    const portfolioId = `maker::${assetId}`;
                    const portfolio = yield this.portfolioRepository.getDetailAsync(portfolioId);
                    if (portfolio) {
                        const msg = `Maker Creation Failed - portfolioId: ${portfolioId} already exists`;
                        throw new __2.ConflictError(msg, { portfolioId });
                    }
                }
            }
            const maker = yield this.createMakerImpl(payload, shouldCreatePortfolio);
            return maker;
        });
    }
    deleteMaker(assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const asset = yield this.assetRepository.getDetailAsync(assetId);
            if (asset) {
                throw new __2.ConflictError(`Cannot Delete Portfolio. Asset Portfolio in use: ${assetId}`);
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
    createMakerImpl(config, shouldCreatePortfolio) {
        return __awaiter(this, void 0, void 0, function* () {
            let maker;
            switch (config.type) {
                case 'bondingmaker1':
                    maker = makers_1.Bonding1Maker.newMaker(config);
                    break;
                case 'bondingmaker2':
                    maker = makers_1.Bonding2Maker.newMaker(config);
                    break;
                case 'logisticmaker1':
                    maker = makers_1.LogarithmicMaker.newMaker(config);
                    break;
                case 'constantk':
                default:
                    maker = makers_1.KMaker.newMaker(config);
                    break;
            }
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
