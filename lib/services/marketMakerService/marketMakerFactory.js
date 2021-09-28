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
exports.MarketMakerFactory = void 0;
const log4js = require("log4js");
const _1 = require(".");
const __1 = require("../..");
const logger = log4js.getLogger('MarketMakerFactory');
class MarketMakerFactory {
    constructor(assetRepository, portfolioRepository, transactionRepository, marketMakerRepository) {
        this.marketMakerRepository = marketMakerRepository;
        this.portfolioRepository = portfolioRepository;
        this.transactionRepository = transactionRepository;
        this.portfolioService = new __1.PortfolioFactory(portfolioRepository);
        this.assetRepository = assetRepository;
        this.exchangeQuoteRepository = new __1.ExchangeQuoteRepository();
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
                case 'constantBondingCurveAMM':
                    marketMaker = new _1.ConstantBondingCurveAMM(this.assetRepository, this.portfolioRepository, this.transactionRepository, this.marketMakerRepository, makerDef);
                    break;
                default:
                case 'linearBondingCurveAMM':
                    marketMaker = new _1.LinearBondingCurveAMM(this.assetRepository, this.portfolioRepository, this.transactionRepository, this.marketMakerRepository, makerDef);
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
                    throw new __1.DuplicateError(msg, { assetId });
                }
                // check for existence of marketMaker portfolio (shouldn't exist if marketMaker doesn't exist)
                if (shouldCreatePortfolio) {
                    const portfolioId = `maker::${assetId}`;
                    const portfolio = yield this.portfolioRepository.getDetailAsync(portfolioId);
                    if (portfolio) {
                        const msg = `MarketMaker Creation Failed - portfolioId: ${portfolioId} already exists`;
                        logger.error(msg);
                        throw new __1.ConflictError(msg, { portfolioId });
                    }
                }
            }
            const marketMaker = yield this._createMarketMakerImpl(payload, shouldCreatePortfolio);
            logger.trace(`created marketMaker: ${marketMaker.assetId}`);
            return marketMaker;
        });
    }
    deleteMaker(assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.marketMakerRepository.deleteAsync(assetId);
        });
    }
    static generateOrder(opts) {
        // eslint-disable-line
        const order = {
            operation: 'order',
            assetId: opts.assetId,
            orderId: opts.orderId,
            portfolioId: opts.portfolioId,
            orderSide: opts.orderSide,
            orderSize: Math.max(opts.orderSize, 0),
            orderType: opts.orderType ? opts.orderType : 'market',
            sizeRemaining: opts.sizeRemaining === undefined ? opts.orderSize : opts.sizeRemaining,
        };
        return order;
    }
    ////////////////////////////////////////////////////////
    // PRIVATE
    ////////////////////////////////////////////////////////
    _createMarketMakerImpl(config, shouldCreatePortfolio) {
        return __awaiter(this, void 0, void 0, function* () {
            let marketMaker;
            switch (config.type) {
                // case 'constantk':
                // default:
                //     marketMaker = KMaker.newMaker(config)
                //     break
                case 'constantBondingCurveAMM':
                    marketMaker = _1.ConstantBondingCurveAMM.newMaker(this.assetRepository, this.portfolioRepository, this.transactionRepository, this.marketMakerRepository, config);
                    break;
                default:
                case 'linearBondingCurveAMM':
                    marketMaker = _1.LinearBondingCurveAMM.newMaker(this.assetRepository, this.portfolioRepository, this.transactionRepository, this.marketMakerRepository, config);
                    break;
            }
            if (shouldCreatePortfolio) {
                const portfolioId = yield this._createMarketMakerPortfolioImpl(marketMaker);
                marketMaker.portfolioId = portfolioId;
            }
            yield this.marketMakerRepository.storeAsync(marketMaker);
            yield this.exchangeQuoteRepository.storeAsync(marketMaker.quote.assetId, marketMaker.quote);
            return marketMaker;
        });
    }
    _createMarketMakerPortfolioImpl(marketMaker) {
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
exports.MarketMakerFactory = MarketMakerFactory;
