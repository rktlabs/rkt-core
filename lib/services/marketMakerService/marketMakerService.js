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
const log4js = require("log4js");
const logger = log4js.getLogger();
const _1 = require(".");
const __1 = require("..");
const __2 = require("../..");
class MarketMakerService {
    constructor(assetRepository, portfolioRepository) {
        this.marketMakerRepository = new __2.MarketMakerRepository();
        this.portfolioRepository = portfolioRepository;
        this.portfolioService = new __1.PortfolioService(portfolioRepository);
        this.assetRepository = assetRepository;
    }
    getMarketMakerAsync(assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const makerDef = yield this.marketMakerRepository.getDetailAsync(assetId);
            if (makerDef == null) {
                return null;
            }
            const makerType = makerDef.type;
            let marketMaker = null;
            switch (makerType) {
                // case 'constantk':
                //     marketMaker = new KMaker(makerDef)
                //     break
                // case 'bondingmaker2':
                //     marketMaker = new Bonding2Maker(makerDef)
                //     break
                // case 'logisticmaker1':
                //     marketMaker = new LogarithmicMaker(makerDef)
                //     break
                default:
                case 'bondingCurveAMM':
                    marketMaker = new _1.BondingCurveAMM(this.assetRepository, this.portfolioRepository, makerDef);
                    break;
            }
            return marketMaker;
        });
    }
    createMarketMaker(payload, shouldCreatePortfolio = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const assetId = payload.assetId;
            if (assetId) {
                const marketMaker = yield this.marketMakerRepository.getDetailAsync(assetId);
                if (marketMaker) {
                    const msg = `MarketMaker Creation Failed - assetId: ${assetId} already exists`;
                    logger.error(msg);
                    throw new __2.DuplicateError(msg, { assetId });
                }
                // check for existence of marketMaker portfolio (shouldn't exist if marketMaker doesn't exist)
                if (shouldCreatePortfolio) {
                    const portfolioId = `maker::${assetId}`;
                    const portfolio = yield this.portfolioRepository.getDetailAsync(portfolioId);
                    if (portfolio) {
                        const msg = `MarketMaker Creation Failed - portfolioId: ${portfolioId} already exists`;
                        logger.error(msg);
                        throw new __2.ConflictError(msg, { portfolioId });
                    }
                }
            }
            const marketMaker = yield this.createMarketMakerImpl(payload, shouldCreatePortfolio);
            logger.info(`created marketMaker: ${marketMaker.assetId}`);
            return marketMaker;
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
            let marketMaker;
            switch (config.type) {
                // case 'bondingmaker2':
                //     marketMaker = Bonding2Maker.newMaker(config)
                //     break
                // case 'logisticmaker1':
                //     marketMaker = LogarithmicMaker.newMaker(config)
                //     break
                // case 'constantk':
                // default:
                //     marketMaker = KMaker.newMaker(config)
                //     break
                default:
                case 'bondingCurveAMM':
                    marketMaker = _1.BondingCurveAMM.newMaker(this.assetRepository, this.portfolioRepository, config);
                    break;
            }
            if (shouldCreatePortfolio) {
                const portfolioId = yield this.createMarketMakerPortfolioImpl(marketMaker);
                marketMaker.portfolioId = portfolioId;
            }
            yield this.marketMakerRepository.storeAsync(marketMaker);
            return marketMaker;
        });
    }
    createMarketMakerPortfolioImpl(marketMaker) {
        return __awaiter(this, void 0, void 0, function* () {
            const makerPortfolioDef = {
                type: 'maker',
                portfolioId: `maker::${marketMaker.assetId}`,
                ownerId: marketMaker.ownerId,
                displayName: marketMaker.assetId,
            };
            const portfolio = yield this.portfolioService.createPortfolio(makerPortfolioDef);
            return portfolio.portfolioId;
        });
    }
}
exports.MarketMakerService = MarketMakerService;
