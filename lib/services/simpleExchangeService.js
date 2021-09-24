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
exports.SimpleExchangeService = void 0;
const __1 = require("..");
class SimpleExchangeService {
    constructor(assetRepository, portfolioRepository, transactionRepository, userRepository, eventPublisher) {
        this.assetHolderRepository = new __1.AssetHolderRepository();
        this.portfolioRepository = portfolioRepository;
        this.userRepository = userRepository;
        this.assetRepository = assetRepository;
        this.transactionService = new __1.TransactionService(assetRepository, portfolioRepository, transactionRepository, eventPublisher);
        this.marketMakerService = new __1.MarketMakerService(assetRepository, portfolioRepository, transactionRepository);
    }
    buy(userId, assetId, orderSize) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.user_transact(userId, assetId, 'bid', orderSize);
        });
    }
    sell(userId, assetId, orderSize) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.user_transact(userId, assetId, 'ask', orderSize);
        });
    }
    user_transact(userId, assetId, orderSide, orderSize) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.getDetailAsync(userId);
            if (!user) {
                const msg = `Order Failed - user not found (${userId})`;
                throw new __1.ConflictError(msg);
            }
            const portfolioId = user.portfolioId;
            if (!portfolioId) {
                const msg = `Order Failed - user portfolio not found (${userId})`;
                throw new __1.ConflictError(msg);
            }
            return this.portfolio_transact(portfolioId, assetId, orderSide, orderSize);
        });
    }
    portfolio_transact(portfolioId, assetId, orderSide, orderSize) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const marketMaker = yield this.marketMakerService.getMarketMakerAsync(assetId);
            if (!marketMaker) {
                const msg = `Order Failed - marketMaker not found (${assetId})`;
                throw new __1.ConflictError(msg);
            }
            if (orderSide === 'bid') {
                yield this.verifyAssetsAsync(portfolioId, assetId, orderSide, orderSize);
            }
            else if (orderSide === 'ask') {
                const currentPrice = ((_a = marketMaker === null || marketMaker === void 0 ? void 0 : marketMaker.quote) === null || _a === void 0 ? void 0 : _a.bid1) || 1;
                yield this.verifyFundsAsync(portfolioId, orderSide, orderSize, currentPrice);
            }
            const asset = yield this.assetRepository.getDetailAsync(assetId);
            if (!asset) {
                const msg = `Order Failed - asset not found (${assetId})`;
                throw new __1.ConflictError(msg);
            }
            const assetPortfolioId = asset.portfolioId;
            if (!assetPortfolioId) {
                const msg = `Order Failed - asset portfolio not defined (${assetId})`;
                throw new __1.ConflictError(msg);
            }
            const tradeUnits = yield marketMaker.processOrderImpl(orderSide, orderSize);
            if (tradeUnits) {
                const { makerDeltaUnits, makerDeltaValue } = tradeUnits;
                if (makerDeltaUnits) {
                    const orderId = '--NA--';
                    const tradeId = '--NA--';
                    const takerPortfolioId = portfolioId;
                    const takerDeltaUnits = makerDeltaUnits * -1;
                    const takerDeltaValue = makerDeltaValue * -1;
                    const makerPortfolioId = assetPortfolioId;
                    yield this.process_transaction(orderId, assetId, tradeId, takerPortfolioId, takerDeltaUnits, takerDeltaValue, makerPortfolioId);
                }
            }
        });
    }
    ////////////////////////////////////////////////////////
    // PRIVATE
    ////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////
    //  xact
    //  - submit new order (order or cancel) to order book
    ////////////////////////////////////////////////////
    process_transaction(orderId, assetId, tradeId, takerPortfolioId, takerDeltaUnits, takerDeltaValue, makerPortfolioId) {
        return __awaiter(this, void 0, void 0, function* () {
            let newTransactionData;
            if (takerDeltaUnits > 0) {
                // deltaUnits > 0 means adding to taker portfolio from asset
                // NOTE: Transaction inputs must have negative size so have to do transaction
                // differetnly depending on direction of trade
                newTransactionData = {
                    inputs: [
                        {
                            portfolioId: makerPortfolioId,
                            assetId,
                            units: takerDeltaUnits * -1,
                        },
                        {
                            portfolioId: takerPortfolioId,
                            assetId: 'coin::rkt',
                            units: takerDeltaValue,
                        },
                    ],
                    outputs: [
                        {
                            portfolioId: takerPortfolioId,
                            assetId,
                            units: takerDeltaUnits,
                        },
                        {
                            portfolioId: makerPortfolioId,
                            assetId: 'coin::rkt',
                            units: takerDeltaValue * -1,
                        },
                    ],
                    tags: {
                        source: 'Simple',
                    },
                    xids: {
                        portfolioId: takerPortfolioId,
                        orderId,
                        tradeId,
                    },
                };
            }
            else {
                newTransactionData = {
                    inputs: [
                        {
                            portfolioId: takerPortfolioId,
                            assetId,
                            units: takerDeltaUnits,
                        },
                        {
                            portfolioId: makerPortfolioId,
                            assetId: 'coin::rkt',
                            units: takerDeltaValue * -1,
                        },
                    ],
                    outputs: [
                        {
                            portfolioId: makerPortfolioId,
                            assetId,
                            units: takerDeltaUnits * -1,
                        },
                        {
                            portfolioId: takerPortfolioId,
                            assetId: 'coin::rkt',
                            units: takerDeltaValue,
                        },
                    ],
                    tags: {
                        source: 'Simple',
                    },
                    xids: {
                        portfolioId: takerPortfolioId,
                        orderId,
                        tradeId,
                    },
                };
            }
            return this.transactionService.executeTransactionAsync(newTransactionData);
        });
    }
    verifyAssetsAsync(portfolioId, assetId, orderSide, orderSize) {
        return __awaiter(this, void 0, void 0, function* () {
            // verify that portfolio exists.
            const portfolio = yield this.portfolioRepository.getDetailAsync(portfolioId);
            if (!portfolio) {
                const msg = `Order Failed - input portfolioId not registered (${portfolioId})`;
                throw new __1.ConflictError(msg);
            }
            const unitsRequired = orderSide === 'ask' ? (0, __1.round4)(orderSize) : 0;
            if (unitsRequired > 0) {
                const portfolioHoldings = yield this.assetHolderRepository.getDetailAsync(assetId, portfolioId);
                const portfolioHoldingUnits = (0, __1.round4)((portfolioHoldings === null || portfolioHoldings === void 0 ? void 0 : portfolioHoldings.units) || 0);
                if (portfolioHoldingUnits < unitsRequired) {
                    // exception
                    const msg = `Order Failed:  portfolio: [${portfolioId}] holding: [${assetId}] has: [${portfolioHoldingUnits}] of required: [${unitsRequired}] `;
                    throw new __1.InsufficientBalance(msg);
                }
            }
        });
    }
    verifyFundsAsync(portfolioId, orderSide, orderSize, currentPrice = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            // verify that portfolio exists.
            const portfolio = yield this.portfolioRepository.getDetailAsync(portfolioId);
            if (!portfolio) {
                const msg = `Order Failed - input portfolioId not registered (${portfolio})`;
                throw new __1.ConflictError(msg);
            }
            ////////////////////////////
            // get bid price and verify funds
            ////////////////////////////
            const COIN_BUFFER_FACTOR = 1.05;
            const paymentAssetId = 'coin::rkt';
            const coinsRequired = orderSide === 'bid' ? (0, __1.round4)(orderSize * currentPrice) * COIN_BUFFER_FACTOR : 0;
            if (coinsRequired > 0) {
                const coinsHeld = yield this.assetHolderRepository.getDetailAsync(paymentAssetId, portfolioId);
                const portfolioHoldingUnits = (0, __1.round4)((coinsHeld === null || coinsHeld === void 0 ? void 0 : coinsHeld.units) || 0);
                if (portfolioHoldingUnits < coinsRequired) {
                    // exception
                    const msg = `Order Failed -  portfolio: [${portfolioId}] holding: [${paymentAssetId}]  has: [${portfolioHoldingUnits}] of required: [${coinsRequired}] `;
                    throw new __1.InsufficientBalance(msg);
                }
            }
        });
    }
}
exports.SimpleExchangeService = SimpleExchangeService;
