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
exports.ExchangeService = void 0;
const log4js = require("log4js");
const luxon_1 = require("luxon");
const logger = log4js.getLogger();
const _1 = require(".");
const __1 = require("../..");
///////////////////////////////////////////////////
// Exchnage Service
// - recieves orders
// - resolves markerMakr for asset in order
// - applies order to markerMaker
// - emits order events as order is processecd
// - applies transaction returned from market maker?
class ExchangeService {
    constructor(eventPublisher) {
        ////////////////////////////////////////////////////
        //  onTrade
        //  - store trade
        //  - publish trade to clearing house
        ////////////////////////////////////////////////////
        this.onTrade = (trade) => __awaiter(this, void 0, void 0, function* () {
            yield this.exchangeTradeRepository.storeAsync(trade); // async - don't wait to finish
            this.orderEventPublisher.publishOrderEventCompleteAsync(trade.taker.portfolioId, trade.taker.orderId, trade.tradeId, 'marketMaker'); // async - don't wait to finish
        });
        this.orderEventPublisher = eventPublisher || new __1.NullEventPublisher();
        this.assetHolderRepository = new __1.AssetHolderRepository();
        this.portfolioRepository = new __1.PortfolioRepository();
        this.exchangeOrderRepository = new __1.ExchangeOrderRepository();
        this.exchangeTradeRepository = new __1.ExchangeTradeRepository();
        this.exchangeQuoteRepository = new __1.ExchangeQuoteRepository();
        this.transactionService = new __1.TransactionService();
        this.makerService = new __1.MakerService();
    }
    ////////////////////////////////////////////////////
    //  handleNewExchangeOrderAsync
    //  - new order handler - accepts raw json as input
    ////////////////////////////////////////////////////
    processNewExchangeOrderAsync(orderPayload) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.debug(`Handle Exchange Order: ${JSON.stringify(orderPayload)}`);
            let exchangeOrder;
            try {
                ////////////////////////////////////
                // Verify source portfolio has adequate funds/units to complete transaction
                ////////////////////////////////////
                const portfolioId = orderPayload.portfolioId;
                const assetId = orderPayload.assetId;
                const orderSide = orderPayload.orderSide;
                const orderSize = orderPayload.orderSize;
                if (orderSide === 'bid') {
                    yield this.verifyAssetsAsync(portfolioId, assetId, orderSide, orderSize);
                }
                else if (orderSide === 'ask') {
                    yield this.verifyFundsAsync(portfolioId, assetId, orderSide, orderSize);
                }
                ////////////////////////////////////
                // order is reasonably complete so mark it as received
                // and STORE it
                ////////////////////////////////////
                exchangeOrder = __1.ExchangeOrder.newExchangeOrder(orderPayload);
                exchangeOrder.status = 'received';
                yield this.exchangeOrderRepository.storeAsync(exchangeOrder);
                // verify that maker exists.
                const orderId = exchangeOrder.orderId;
                const order = new _1.TakerOrder({
                    assetId: assetId,
                    orderId: orderId,
                    portfolioId: portfolioId,
                    orderSide: orderSide,
                    orderSize: orderSize,
                });
                ////////////////////////////////////////////////////////
                // Process the order
                ////////////////////////////////////////////////////////
                const maker = yield this.makerService.getMakerAsync(assetId);
                if (maker) {
                    const trade = yield maker.processTakerOrder(order);
                    if (trade) {
                        if (trade.taker.filledSize) {
                            yield this.onFill(trade.taker);
                            yield this.onTrade(trade);
                            const takerPortfolioId = trade.taker.portfolioId;
                            const takerDeltaUnits = trade.taker.filledSize;
                            const takerDeltaValue = trade.taker.filledValue;
                            const makerPortfolioId = trade.makers[0].portfolioId;
                            yield this.process_transaction(orderId, exchangeOrder.assetId, trade.tradeId, takerPortfolioId, takerDeltaUnits, takerDeltaValue, makerPortfolioId);
                        }
                    }
                }
            }
            catch (error) {
                if (exchangeOrder && exchangeOrder.status === 'received') {
                    // received and stored
                    const reason = error.message;
                    yield this.exchangeOrderRepository.updateAsync(exchangeOrder.portfolioId, exchangeOrder.orderId, {
                        status: 'error',
                        state: 'closed',
                        closedAt: luxon_1.DateTime.utc().toString(),
                        reason,
                    });
                    this.orderEventPublisher.publishOrderEventFailedAsync(exchangeOrder.portfolioId, exchangeOrder.orderId, reason, 'marketMaker'); // async - don't wait to finish
                }
                throw error;
            }
            return exchangeOrder;
        });
    }
    ////////////////////////////////////////////////////////
    // PRIVATE
    ////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////
    //  onFill
    //  - handle order fill resulting from trade
    ////////////////////////////////////////////////////
    onFill(taker) {
        return __awaiter(this, void 0, void 0, function* () {
            const orderId = taker.orderId;
            const portfolioId = taker.portfolioId;
            const filledSize = taker.filledSize;
            const filledValue = taker.filledValue;
            const filledPrice = taker.filledPrice;
            const makerRemaining = taker.sizeRemaining;
            this.orderEventPublisher.publishOrderEventFillAsync(portfolioId, orderId, filledSize, filledValue, filledPrice, makerRemaining, 'marketMaker'); // async - don't wait to finish
            const newMakerStatus = taker.isClosed ? 'filled' : 'partial';
            const newMakerState = !taker.isClosed && taker.sizeRemaining > 0 ? 'open' : 'closed';
            yield this.exchangeOrderRepository.updateAsync(portfolioId, orderId, {
                status: newMakerStatus,
                state: newMakerState,
                executedAt: luxon_1.DateTime.utc().toString(),
                filledSize,
                filledValue,
                filledPrice,
                sizeRemaining: makerRemaining,
            }); // async - don't wait to finish
        });
    }
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
                        source: 'AMM',
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
                        source: 'AMM',
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
    verifyFundsAsync(portfolioId, assetId, orderSide, orderSize) {
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
                    const msg = `Order Failed -  portfolio: [${portfolioId}] holding: [${paymentAssetId}]  has: [${portfolioHoldingUnits}] of required: [${coinsRequired}] `;
                    throw new __1.InsufficientBalance(msg);
                }
            }
        });
    }
}
exports.ExchangeService = ExchangeService;
