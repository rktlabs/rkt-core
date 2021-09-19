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
    constructor(eventPublisher) {
        this.assetHolderRepository = new __1.AssetHolderRepository();
        this.portfolioRepository = new __1.PortfolioRepository();
        this.userRepository = new __1.UserRepository();
        this.assetRepository = new __1.AssetRepository();
        this.exchangeQuoteRepository = new __1.ExchangeQuoteRepository();
        this.transactionService = new __1.TransactionService(eventPublisher);
        this.makerService = new __1.MakerService();
    }
    buy(userId, assetId, units) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.transact(userId, assetId, 'bid', units);
        });
    }
    sell(userId, assetId, units) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.transact(userId, assetId, 'ask', units);
        });
    }
    transact(userId, assetId, orderSide, orderSize) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.getDetailAsync(userId);
            if (!user) {
                return null;
            }
            const portfolioId = user.portfolioId;
            if (!portfolioId) {
                return null;
            }
            const asset = yield this.assetRepository.getDetailAsync(assetId);
            if (!asset) {
                return null;
            }
            const assetPortfolioId = asset.portfolioId;
            if (!assetPortfolioId) {
                return null;
            }
            const orderId = '--NA--'; // orderId
            const maker = yield this.makerService.getMakerAsync(assetId);
            if (!maker) {
                return null;
            }
            if (orderSide === 'bid') {
                yield this.verifyAssetsAsync(portfolioId, assetId, orderSide, orderSize);
            }
            else if (orderSide === 'ask') {
                yield this.verifyFundsAsync(portfolioId, assetId, orderSide, orderSize);
            }
            const tradeUnits = yield maker.processSimpleOrder(assetId, orderSide, orderSize);
            if (!tradeUnits) {
                return null;
            }
            const { makerDeltaUnits, makerDeltaCoins } = tradeUnits;
            if (makerDeltaUnits) {
                const takerPortfolioId = portfolioId;
                const takerDeltaUnits = makerDeltaUnits * -1;
                const takerDeltaValue = makerDeltaCoins * -1;
                const makerPortfolioId = assetPortfolioId;
                yield this.xact(orderId, assetId, '--NA--', // tradeId
                takerPortfolioId, takerDeltaUnits, takerDeltaValue, makerPortfolioId);
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
    xact(orderId, assetId, tradeId, takerPortfolioId, takerDeltaUnits, takerDeltaValue, makerPortfolioId) {
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
                            cost: takerDeltaValue,
                        },
                        {
                            portfolioId: takerPortfolioId,
                            assetId: 'coin::rkt',
                            units: takerDeltaValue,
                            cost: takerDeltaValue,
                        },
                    ],
                    outputs: [
                        {
                            portfolioId: takerPortfolioId,
                            assetId,
                            units: takerDeltaUnits,
                            cost: takerDeltaValue * -1,
                        },
                        {
                            portfolioId: makerPortfolioId,
                            assetId: 'coin::rkt',
                            units: takerDeltaValue * -1,
                            cost: takerDeltaValue * -1,
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
                            cost: takerDeltaValue * -1,
                        },
                        {
                            portfolioId: makerPortfolioId,
                            assetId: 'coin::rkt',
                            units: takerDeltaValue * -1,
                            cost: takerDeltaValue * -1,
                        },
                    ],
                    outputs: [
                        {
                            portfolioId: makerPortfolioId,
                            assetId,
                            units: takerDeltaUnits * -1,
                            cost: takerDeltaValue,
                        },
                        {
                            portfolioId: takerPortfolioId,
                            assetId: 'coin::rkt',
                            units: takerDeltaValue,
                            cost: takerDeltaValue,
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
                const msg = `Simple Order Failed - input portfolioId not registered (${portfolioId})`;
                throw new __1.ConflictError(msg);
            }
            const unitsRequired = orderSide === 'ask' ? (0, __1.round4)(orderSize) : 0;
            if (unitsRequired > 0) {
                const portfolioHoldings = yield this.assetHolderRepository.getDetailAsync(assetId, portfolioId);
                const portfolioHoldingUnits = (0, __1.round4)((portfolioHoldings === null || portfolioHoldings === void 0 ? void 0 : portfolioHoldings.units) || 0);
                if (portfolioHoldingUnits < unitsRequired) {
                    // exception
                    const msg = `Simple Order Failed:  portfolio: [${portfolioId}] asset holding: [${assetId}] has: [${portfolioHoldingUnits}] of required: [${unitsRequired}] `;
                    throw new __1.InsufficientBalance(msg);
                }
            }
        });
    }
    verifyFundsAsync(portfolioId, assetId, orderSide, orderSize) {
        return __awaiter(this, void 0, void 0, function* () {
            // verify that portfolio exists.
            const portfolio = yield this.portfolioRepository.getDetailAsync(portfolioId);
            if (!portfolio) {
                const msg = `Simple Order Failed - input portfolioId not registered (${portfolio})`;
                throw new __1.ConflictError(msg);
            }
            ////////////////////////////
            // get bid price and verify funds
            ////////////////////////////
            const quote = yield this.exchangeQuoteRepository.getDetailAsync(assetId);
            const price = (quote === null || quote === void 0 ? void 0 : quote.bid) || 1;
            const COIN_BUFFER_FACTOR = 1.05;
            const paymentAssetId = 'coin::rkt';
            const coinsRequired = orderSide === 'bid' ? (0, __1.round4)(orderSize * price) * COIN_BUFFER_FACTOR : 0;
            if (coinsRequired > 0) {
                const coinsHeld = yield this.assetHolderRepository.getDetailAsync(paymentAssetId, portfolioId);
                const portfolioHoldingUnits = (0, __1.round4)((coinsHeld === null || coinsHeld === void 0 ? void 0 : coinsHeld.units) || 0);
                if (portfolioHoldingUnits < coinsRequired) {
                    // exception
                    const msg = `Simple Order Failed -  portfolio: [${portfolioId}] coin holding: [${paymentAssetId}] has: [${portfolioHoldingUnits}] of required: [${coinsRequired}] `;
                    throw new __1.InsufficientBalance(msg);
                }
            }
        });
    }
}
exports.SimpleExchangeService = SimpleExchangeService;
