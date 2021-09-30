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
const marketMakerService_1 = require("../services/marketMakerService");
const __1 = require("..");
const logger = log4js.getLogger('MarketMakerFactory');
class MarketMakerFactory {
    constructor(assetRepository, portfolioRepository, transactionRepository, marketMakerRepository) {
        this.marketMakerRepository = marketMakerRepository;
        this.portfolioRepository = portfolioRepository;
        this.transactionRepository = transactionRepository;
        this.portfolioFactory = new __1.PortfolioFactory(portfolioRepository);
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
            let marketMakerService = null;
            switch (makerType) {
                // case 'constantk':
                //     marketMaker = new KMaker(makerDef)
                //     break
                case 'constantBondingCurveAMM':
                    marketMakerService = new marketMakerService_1.ConstantBondingCurveAMM(this.assetRepository, this.portfolioRepository, this.transactionRepository, this.marketMakerRepository, makerDef);
                    break;
                default:
                case 'linearBondingCurveAMM':
                    marketMakerService = new marketMakerService_1.LinearBondingCurveAMM(this.assetRepository, this.portfolioRepository, this.transactionRepository, this.marketMakerRepository, makerDef);
                    break;
            }
            return marketMakerService;
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
            logger.trace(`created marketMaker: ${marketMaker.marketMaker.assetId}`);
            return marketMaker;
        });
    }
    deleteMaker(assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.marketMakerRepository.deleteAsync(assetId);
        });
    }
    ////////////////////////////////////////////////////////
    // PRIVATE
    ////////////////////////////////////////////////////////
    _createMarketMakerImpl(config, shouldCreatePortfolio) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let marketMaker;
            switch (config.type) {
                // case 'constantk':
                // default:
                //     marketMaker = KMaker.newMaker(config)
                //     break
                case 'constantBondingCurveAMM':
                    marketMaker = marketMakerService_1.ConstantBondingCurveAMM.newMaker(this.assetRepository, this.portfolioRepository, this.transactionRepository, this.marketMakerRepository, config);
                    break;
                default:
                case 'linearBondingCurveAMM':
                    marketMaker = marketMakerService_1.LinearBondingCurveAMM.newMaker(this.assetRepository, this.portfolioRepository, this.transactionRepository, this.marketMakerRepository, config);
                    break;
            }
            if (shouldCreatePortfolio) {
                const portfolioId = yield this._createMarketMakerPortfolioImpl(marketMaker);
                marketMaker.marketMaker.portfolioId = portfolioId;
            }
            yield this.marketMakerRepository.storeAsync(marketMaker.marketMaker);
            if (marketMaker.marketMaker.quote) {
                yield this.exchangeQuoteRepository.storeAsync((_a = marketMaker.marketMaker.quote) === null || _a === void 0 ? void 0 : _a.assetId, marketMaker.marketMaker.quote);
            }
            return marketMaker;
        });
    }
    _createMarketMakerPortfolioImpl(marketMaker) {
        return __awaiter(this, void 0, void 0, function* () {
            const makerPortfolioDef = {
                type: 'maker',
                portfolioId: `maker::${marketMaker.marketMaker.assetId}`,
                ownerId: marketMaker.marketMaker.ownerId,
                displayName: marketMaker.marketMaker.assetId,
            };
            const portfolio = yield this.portfolioFactory.createPortfolio(makerPortfolioDef);
            return portfolio.portfolioId;
        });
    }
}
exports.MarketMakerFactory = MarketMakerFactory;
