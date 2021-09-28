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
const events_1 = require("events");
const log4js = require("log4js");
const luxon_1 = require("luxon");
const _1 = require(".");
const __1 = require("..");
const logger = log4js.getLogger();
///////////////////////////////////////////////////
// Exchnage Service
// - recieves orders
// - resolves markerMakr for asset in order
// - applies order to markerMaker
// - emits order events as order is processecd
// - applies transaction returned from marketMaker?
class ExchangeService {
    constructor(assetRepository, portfolioRepository, transactionRepository, marketMakerRepository, emitter) {
        this._updateExchangeOrder = (orderId, payload) => __awaiter(this, void 0, void 0, function* () {
            let exchangeOrder = yield this.exchangeOrderRepository.getDetailAsync(orderId);
            if (!exchangeOrder) {
                return;
            }
            exchangeOrder.filledSize = (exchangeOrder.filledSize || 0) + (payload.filledSize || 0);
            exchangeOrder.filledValue = (exchangeOrder.filledValue || 0) + (payload.filledValue || 0);
            exchangeOrder.filledPrice =
                exchangeOrder.filledSize === 0 ? 0 : Math.abs((0, __1.round4)(exchangeOrder.filledValue / exchangeOrder.filledSize));
            exchangeOrder.sizeRemaining = payload.sizeRemaining;
            const orderUpdate = {
                orderStatus: payload.orderStatus,
                orderState: payload.orderState,
                executedAt: payload.executedAt,
                filledSize: exchangeOrder.filledSize,
                filledValue: exchangeOrder.filledValue,
                filledPrice: exchangeOrder.filledSize === 0
                    ? 0
                    : Math.abs((0, __1.round4)(exchangeOrder.filledValue / exchangeOrder.filledSize)),
                sizeRemaining: exchangeOrder.sizeRemaining,
            };
            yield this.exchangeOrderRepository.updateAsync(orderId, orderUpdate);
            return exchangeOrder;
        });
        ////////////////////////////////////////////////////
        //  onUpdateQuote
        //  - store new quoted for the asset indicated
        ////////////////////////////////////////////////////
        this._onUpdateQuote = (quote) => __awaiter(this, void 0, void 0, function* () {
            yield this.exchangeQuoteRepository.storeAsync(quote.assetId, quote);
        });
        this.assetHolderRepository = new __1.AssetHolderRepository();
        this.portfolioRepository = portfolioRepository;
        this.exchangeOrderRepository = new __1.ExchangeOrderRepository();
        this.exchangeTradeRepository = new __1.ExchangeTradeRepository();
        this.exchangeQuoteRepository = new __1.ExchangeQuoteRepository();
        this.transactionService = new _1.TransactionService(assetRepository, portfolioRepository, transactionRepository);
        this.marketMakerService = new _1.MarketMakerFactory(assetRepository, portfolioRepository, transactionRepository, marketMakerRepository);
        if (emitter) {
            this.emitter = emitter;
        }
        else {
            this.emitter = new events_1.EventEmitter();
        }
    }
    on(event, listener) {
        this.emitter.on(event, listener);
    }
    emitOrderExecution(event) {
        this.emitter.emit('orderExecution', event);
    }
    emitOrderFail(event) {
        this.emitter.emit('orderExecution', event);
    }
    ////////////////////////////////////////////////////
    //  handleNewExchangeOrderAsync
    //  - new order handler - accepts raw json as input
    ////////////////////////////////////////////////////
    processOrder(orderPayload) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            logger.trace(`processOrder`, orderPayload);
            let exchangeOrder;
            try {
                ////////////////////////////////////
                // Verify source portfolio has adequate funds/units to complete transaction
                ////////////////////////////////////
                const portfolioId = orderPayload.portfolioId;
                const assetId = orderPayload.assetId;
                const orderSide = orderPayload.orderSide;
                const orderSize = orderPayload.orderSize;
                ////////////////////////////////////////////////////////
                // Process the order
                ////////////////////////////////////////////////////////
                const marketMaker = yield this.marketMakerService.getMarketMakerAsync(assetId);
                if (marketMaker) {
                    ////////////////////////////////////////////////////////
                    // Set up the handlers for emitted trades and quote updates
                    ////////////////////////////////////////////////////////
                    marketMaker.on('quote', (quote) => {
                        this._onUpdateQuote(quote);
                    });
                    marketMaker.on('trade', (trade) => {
                        this._onTrade(trade);
                    });
                    if (orderSide === 'bid') {
                        yield this._verifyAssetsAsync(portfolioId, assetId, orderSide, orderSize);
                    }
                    else if (orderSide === 'ask') {
                        ////////////////////////////
                        // get bid price and verify funds
                        ////////////////////////////
                        const currentPrice = ((_a = marketMaker === null || marketMaker === void 0 ? void 0 : marketMaker.quote) === null || _a === void 0 ? void 0 : _a.ask) || 1;
                        yield this._verifyFundsAsync(portfolioId, orderSide, orderSize, currentPrice);
                    }
                    ////////////////////////////////////
                    // order is reasonably complete so mark it as received
                    // and STORE it
                    ////////////////////////////////////
                    exchangeOrder = __1.ExchangeOrder.newExchangeOrder(orderPayload);
                    yield this.exchangeOrderRepository.storeAsync(exchangeOrder);
                    const orderId = exchangeOrder.orderId;
                    const order = _1.MarketMakerFactory.generateOrder({
                        operation: 'order',
                        orderType: 'market',
                        assetId: assetId,
                        orderId: orderId,
                        portfolioId: portfolioId,
                        orderSide: orderSide,
                        orderSize: orderSize,
                    });
                    yield marketMaker.processOrder(order);
                }
            }
            catch (error) {
                if (exchangeOrder && exchangeOrder.orderStatus === 'received') {
                    // received and stored
                    const reason = error.message;
                    const updateData = {
                        orderStatus: 'error',
                        orderState: 'closed',
                        closedAt: luxon_1.DateTime.utc().toString(),
                    };
                    if (reason)
                        updateData.reason = reason;
                    yield this.exchangeOrderRepository.updateAsync(exchangeOrder.orderId, updateData);
                    this.emitOrderFail({
                        eventType: 'orderFail',
                        publishedAt: luxon_1.DateTime.utc().toString(),
                        orderId: exchangeOrder.orderId,
                        portfolioId: exchangeOrder.portfolioId,
                        reason: reason,
                    });
                }
                logger.error(error);
                throw error;
            }
            return exchangeOrder;
        });
    }
    ////////////////////////////////////////////////////////
    // PRIVATE
    ////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////
    //  onTrade
    //  - store trade
    //  - publish trade to clearing house
    ////////////////////////////////////////////////////
    _onTrade(trade) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('onTrade', trade);
            if (trade) {
                if (trade.taker.filledSize) {
                    yield this.exchangeTradeRepository.storeAsync(trade); // async - don't wait to finish
                    yield this._processTransaction(trade.taker.orderId, trade.assetId, trade.tradeId, trade.taker.portfolioId, trade.taker.filledSize, trade.taker.filledValue, trade.makers[0].portfolioId);
                    yield this._deliverOrderUpdateStatus(trade);
                }
            }
        });
    }
    ////////////////////////////////////////////////////
    //  onFill
    //  - handle order fill resulting from trade
    ////////////////////////////////////////////////////
    _deliverOrderUpdateStatus(trade) {
        return __awaiter(this, void 0, void 0, function* () {
            /////////////////////////
            // first do taker
            /////////////////////////
            // NOTE: This is an async operation with no wait.
            this._deliverTakerOrderUpdate(trade.tradeId, trade.taker);
            /////////////////////////
            // Then do makers
            /////////////////////////
            // NOTE: This is an async operation with no wait.
            trade.makers.forEach((maker) => __awaiter(this, void 0, void 0, function* () {
                this._deliverMakerOrderUpdate(trade.tradeId, maker);
            }));
        });
    }
    _deliverMakerOrderUpdate(tradeId, maker) {
        return __awaiter(this, void 0, void 0, function* () {
            // nothing to do here right now.
            // for Automated market makers, there is no source order so nothing to notify
            if (maker.orderId) {
                logger.warn('Maker Update should not be here. should be no order Id for maker with AMM');
            }
        });
    }
    _deliverTakerOrderUpdate(tradeId, taker) {
        return __awaiter(this, void 0, void 0, function* () {
            this._updateExchangeOrder(taker.orderId, {
                orderStatus: taker.isClosed ? 'filled' : 'partial',
                orderState: !taker.isClosed && taker.sizeRemaining > 0 ? 'open' : 'closed',
                executedAt: luxon_1.DateTime.utc().toString(),
                filledSize: taker.filledSize,
                filledValue: taker.filledValue,
                filledPrice: taker.filledPrice,
                sizeRemaining: taker.sizeRemaining,
            }); // async - don't wait to finish
            const event = {
                eventType: 'orderExecution',
                publishedAt: luxon_1.DateTime.utc().toString(),
                orderId: taker.orderId,
                portfolioId: taker.portfolioId,
                filledSize: taker.filledSize,
                filledValue: taker.filledValue,
                filledPrice: taker.filledPrice,
                sizeRemaining: taker.sizeRemaining,
                tradeId: tradeId,
            };
            this.emitOrderExecution(event);
        });
    }
    ////////////////////////////////////////////////////
    //  xact
    //  - submit new order (order or cancel) to order book
    ////////////////////////////////////////////////////
    _processTransaction(takerOrderId, assetId, tradeId, takerPortfolioId, takerDeltaUnits, takerDeltaValue, makerPortfolioId) {
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
                };
            }
            newTransactionData.tags = { source: 'Trade' };
            // set the orderId
            newTransactionData.xids = {
                orderId: takerOrderId,
                orderPortfolioId: takerPortfolioId,
                tradeId: tradeId,
            };
            return this.transactionService.executeTransactionAsync(newTransactionData);
        });
    }
    _verifyAssetsAsync(portfolioId, assetId, orderSide, orderSize) {
        return __awaiter(this, void 0, void 0, function* () {
            // verify that portfolio exists.
            const portfolio = yield this.portfolioRepository.getDetailAsync(portfolioId);
            if (!portfolio) {
                const msg = `Order Failed - input portfolioId not registered (${portfolioId})`;
                logger.error(msg);
                throw new __1.ConflictError(msg);
            }
            const unitsRequired = orderSide === 'ask' ? (0, __1.round4)(orderSize) : 0;
            if (unitsRequired > 0) {
                const portfolioHoldings = yield this.assetHolderRepository.getDetailAsync(assetId, portfolioId);
                const portfolioHoldingUnits = (0, __1.round4)((portfolioHoldings === null || portfolioHoldings === void 0 ? void 0 : portfolioHoldings.units) || 0);
                if (portfolioHoldingUnits < unitsRequired) {
                    // exception
                    const msg = `Order Failed:  portfolio: [${portfolioId}] holding: [${assetId}] has: [${portfolioHoldingUnits}] of required: [${unitsRequired}] `;
                    logger.error(msg);
                    throw new __1.InsufficientBalance(msg);
                }
            }
        });
    }
    _verifyFundsAsync(portfolioId, orderSide, orderSize, currentPrice = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            // verify that portfolio exists.
            const portfolio = yield this.portfolioRepository.getDetailAsync(portfolioId);
            if (!portfolio) {
                const msg = `Order Failed - input portfolioId not registered (${portfolio})`;
                logger.error(msg);
                throw new __1.ConflictError(msg);
            }
            const COIN_BUFFER_FACTOR = 1.05;
            const paymentAssetId = 'coin::rkt';
            const coinsRequired = orderSide === 'bid' ? (0, __1.round4)(orderSize * currentPrice) * COIN_BUFFER_FACTOR : 0;
            if (coinsRequired > 0) {
                const coinsHeld = yield this.assetHolderRepository.getDetailAsync(paymentAssetId, portfolioId);
                const portfolioHoldingUnits = (0, __1.round4)((coinsHeld === null || coinsHeld === void 0 ? void 0 : coinsHeld.units) || 0);
                if (portfolioHoldingUnits < coinsRequired) {
                    // exception
                    const msg = `Order Failed -  portfolio: [${portfolioId}] holding: [${paymentAssetId}]  has: [${portfolioHoldingUnits}] of required: [${coinsRequired}] `;
                    logger.error(msg);
                    throw new __1.InsufficientBalance(msg);
                }
            }
        });
    }
}
exports.ExchangeService = ExchangeService;
