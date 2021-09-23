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
exports.MarketMakerService = void 0;
const _1 = require(".");
const __1 = require("..");
const __2 = require("../..");
class MarketMakerService {
    constructor() {
        this.marketMakerRepository = new __2.MarketMakerRepository();
        this.portfolioRepository = new __2.PortfolioRepository();
        this.portfolioService = new __1.PortfolioService();
    }
    getMakerAsync(assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const makerDef = yield this.marketMakerRepository.getDetailAsync(assetId);
            if (makerDef == null) {
                return null;
            }
            const makerType = makerDef.type;
            let maker = null;
            switch (makerType) {
                // case 'constantk':
                //     maker = new KMaker(makerDef)
                //     break
                // case 'bondingmaker2':
                //     maker = new Bonding2Maker(makerDef)
                //     break
                // case 'logisticmaker1':
                //     maker = new LogarithmicMaker(makerDef)
                //     break
                default:
                case 'bondingCurveAMM':
                    maker = new _1.BondingCurveAMM(makerDef);
                    break;
            }
            return maker;
        });
    }
    createMarketMaker(payload, shouldCreatePortfolio = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const assetId = payload.assetId;
            if (assetId) {
                const maker = yield this.marketMakerRepository.getDetailAsync(assetId);
                if (maker) {
                    const msg = `MarketMaker Creation Failed - assetId: ${assetId} already exists`;
                    throw new __2.DuplicateError(msg, { assetId });
                }
                // check for existence of maker portfolio (shouldn't exist if maker doesn't exist)
                if (shouldCreatePortfolio) {
                    const portfolioId = `maker::${assetId}`;
                    const portfolio = yield this.portfolioRepository.getDetailAsync(portfolioId);
                    if (portfolio) {
                        const msg = `MarketMaker Creation Failed - portfolioId: ${portfolioId} already exists`;
                        throw new __2.ConflictError(msg, { portfolioId });
                    }
                }
            }
            const maker = yield this.createMarketMakerImpl(payload, shouldCreatePortfolio);
            return maker;
        });
    }
    deleteMaker(assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.scrubMarketMaker(assetId);
        });
    }
    scrubMarketMaker(assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const portfolioId = `maker::${assetId}`;
            yield this.portfolioService.scrubPortfolio(portfolioId);
            yield this.marketMakerRepository.deleteAsync(assetId);
        });
    }
    static generateOrder(opts) {
        // eslint-disable-line
        const order = {
            assetId: opts.assetId,
            orderId: opts.orderId,
            portfolioId: opts.portfolioId,
            orderSide: opts.orderSide,
            orderSize: Math.max(opts.orderSize, 0),
            tags: opts.tags,
            orderType: opts.orderType ? opts.orderType : 'market',
            sizeRemaining: opts.sizeRemaining === undefined ? opts.orderSize : opts.sizeRemaining,
            orderStatus: 'new',
            orderState: 'open',
        };
        return order;
    }
    ////////////////////////////////////////////////////////
    // PRIVATE
    ////////////////////////////////////////////////////////
    createMarketMakerImpl(config, shouldCreatePortfolio) {
        return __awaiter(this, void 0, void 0, function* () {
            let maker;
            switch (config.type) {
                // case 'bondingmaker2':
                //     maker = Bonding2Maker.newMaker(config)
                //     break
                // case 'logisticmaker1':
                //     maker = LogarithmicMaker.newMaker(config)
                //     break
                // case 'constantk':
                // default:
                //     maker = KMaker.newMaker(config)
                //     break
                default:
                case 'bondingCurveAMM':
                    maker = _1.BondingCurveAMM.newMaker(config);
                    break;
            }
            if (shouldCreatePortfolio) {
                const portfolioId = yield this.createMarketMakerPortfolioImpl(maker);
                maker.portfolioId = portfolioId;
            }
            yield this.marketMakerRepository.storeAsync(maker);
            return maker;
        });
    }
    createMarketMakerPortfolioImpl(maker) {
        return __awaiter(this, void 0, void 0, function* () {
            const makerPortfolioDef = {
                type: 'maker',
                portfolioId: `maker::${maker.assetId}`,
                ownerId: maker.ownerId,
                displayName: maker.assetId,
            };
            const portfolio = yield this.portfolioService.createPortfolio(makerPortfolioDef);
            return portfolio.portfolioId;
        });
    }
}
exports.MarketMakerService = MarketMakerService;
