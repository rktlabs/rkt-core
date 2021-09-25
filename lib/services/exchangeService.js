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
    constructor(assetRepository, portfolioRepository, transactionRepository, marketMakerRepository, portfolioOrderRepository, eventPublisher) {
        ////////////////////////////////////////////////////////
        // PRIVATE
        ////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////
        //  onFill
        //  - handle order fill resulting from trade
        ////////////////////////////////////////////////////
        this.processFillEvent = (portfolioId, orderId, payload) => __awaiter(this, void 0, void 0, function* () {
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
                status: payload.status,
                state: payload.state,
                executedAt: payload.executedAt,
                filledSize: exchangeOrder.filledSize,
                filledValue: exchangeOrder.filledValue,
                filledPrice: exchangeOrder.filledSize === 0
                    ? 0
                    : Math.abs((0, __1.round4)(exchangeOrder.filledValue / exchangeOrder.filledSize)),
                sizeRemaining: exchangeOrder.sizeRemaining,
            };
            yield this.exchangeOrderRepository.updateAsync(portfolioId, orderId, orderUpdate);
            return exchangeOrder;
        });
        ////////////////////////////////////////////////////
        //  onTrade
        //  - store trade
        //  - publish trade to clearing house
        ////////////////////////////////////////////////////
        this.onTrade = (trade) => __awaiter(this, void 0, void 0, function* () {
            yield this.exchangeTradeRepository.storeAsync(trade); // async - don't wait to finish
            // await this.portfolioOrderEventService.processComplete({
            //     eventType: 'orderComplete',
            //     publishedAt: DateTime.utc().toString(),
            //     orderId: trade.taker.orderId,
            //     portfolioId: trade.taker.portfolioId,
            //     tradeId: trade.tradeId,
            // })
        });
        ////////////////////////////////////////////////////
        //  onUpdateQuote
        //  - store new quoted for the asset indicated
        ////////////////////////////////////////////////////
        this.onUpdateQuote = (marketMaker) => __awaiter(this, void 0, void 0, function* () {
            const assetId = marketMaker.assetId;
            const marketMakerQuote = marketMaker.quote;
            const exchangeQuote = Object.assign({ assetId: marketMaker.assetId }, marketMakerQuote);
            yield this.exchangeQuoteRepository.storeAsync(assetId, exchangeQuote);
        });
        this.orderNotificationPublisher = eventPublisher || new __1.NullNotificationPublisher();
        this.assetHolderRepository = new __1.AssetHolderRepository();
        this.portfolioRepository = portfolioRepository;
        this.exchangeOrderRepository = new __1.ExchangeOrderRepository();
        this.exchangeTradeRepository = new __1.ExchangeTradeRepository();
        this.exchangeQuoteRepository = new __1.ExchangeQuoteRepository();
        this.transactionService = new __1.TransactionService(assetRepository, portfolioRepository, transactionRepository);
        this.marketMakerService = new __1.MarketMakerService(assetRepository, portfolioRepository, transactionRepository, marketMakerRepository);
        this.portfolioOrderEventService = new __1.PortfolioOrderEventService(portfolioOrderRepository);
    }
    ////////////////////////////////////////////////////
    //  handleNewExchangeOrderAsync
    //  - new order handler - accepts raw json as input
    ////////////////////////////////////////////////////
    submitNewExchangeOrderAsync(orderPayload) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            logger.debug(`processNewExchangeOrderAsync: ${JSON.stringify(orderPayload)}`);
            let exchangeOrder;
            try {
                ////////////////////////////////////
                // Verify source portfolio has adequate funds/units to complete transaction
                ////////////////////////////////////
                const portfolioId = orderPayload.portfolioId;
                const assetId = orderPayload.assetId;
                const orderSide = orderPayload.orderSide;
                const orderSize = orderPayload.orderSize;
                // TODO TODO - get quoted from marketMaker. get marketMaker first here. will
                // eliminate redundant read
                ////////////////////////////////////////////////////////
                // Process the order
                ////////////////////////////////////////////////////////
                const marketMaker = yield this.marketMakerService.getMarketMakerAsync(assetId);
                if (marketMaker) {
                    if (orderSide === 'bid') {
                        yield this.verifyAssetsAsync(portfolioId, assetId, orderSide, orderSize);
                    }
                    else if (orderSide === 'ask') {
                        ////////////////////////////
                        // get bid price and verify funds
                        ////////////////////////////
                        const currentPrice = ((_a = marketMaker === null || marketMaker === void 0 ? void 0 : marketMaker.quote) === null || _a === void 0 ? void 0 : _a.bid1) || 1;
                        yield this.verifyFundsAsync(portfolioId, orderSide, orderSize, currentPrice);
                    }
                    ////////////////////////////////////
                    // order is reasonably complete so mark it as received
                    // and STORE it
                    ////////////////////////////////////
                    exchangeOrder = __1.ExchangeOrder.newExchangeOrder(orderPayload);
                    exchangeOrder.status = 'received';
                    yield this.exchangeOrderRepository.storeAsync(exchangeOrder);
                    const orderId = exchangeOrder.orderId;
                    const order = __1.MarketMakerService.generateOrder({
                        assetId: assetId,
                        orderId: orderId,
                        portfolioId: portfolioId,
                        orderSide: orderSide,
                        orderSize: orderSize,
                    });
                    const trade = yield marketMaker.processOrder(order);
                    if (trade) {
                        if (trade.taker.filledSize) {
                            yield this.onFill(trade);
                            yield this.onTrade(trade);
                            yield this.onUpdateQuote(marketMaker);
                            const takerPortfolioId = trade.taker.portfolioId;
                            const takerDeltaUnits = trade.taker.filledSize;
                            const takerDeltaValue = trade.taker.filledValue;
                            const makerPortfolioId = trade.makers[0].portfolioId;
                            yield this.processTransaction(orderId, exchangeOrder.assetId, trade.tradeId, takerPortfolioId, takerDeltaUnits, takerDeltaValue, makerPortfolioId);
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
                    this.portfolioOrderEventService.processFailEvent({
                        eventType: 'orderFail',
                        publishedAt: luxon_1.DateTime.utc().toString(),
                        orderId: exchangeOrder.orderId,
                        portfolioId: exchangeOrder.portfolioId,
                        reason: reason,
                    });
                }
                throw error;
            }
            return exchangeOrder;
        });
    }
    onFill(trade) {
        return __awaiter(this, void 0, void 0, function* () {
            const taker = trade.taker;
            const orderId = taker.orderId;
            const portfolioId = taker.portfolioId;
            const filledSize = taker.filledSize;
            const filledValue = taker.filledValue;
            const filledPrice = taker.filledPrice;
            const makerRemaining = taker.sizeRemaining;
            const newMakerStatus = taker.isClosed ? 'filled' : 'partial';
            const newMakerState = !taker.isClosed && taker.sizeRemaining > 0 ? 'open' : 'closed';
            yield this.processFillEvent(portfolioId, orderId, {
                status: newMakerStatus,
                state: newMakerState,
                executedAt: luxon_1.DateTime.utc().toString(),
                filledSize,
                filledValue,
                filledPrice,
                sizeRemaining: makerRemaining,
            }); // async - don't wait to finish
            this.portfolioOrderEventService.processFillEvent({
                eventType: 'orderFill',
                publishedAt: luxon_1.DateTime.utc().toString(),
                orderId: orderId,
                portfolioId: portfolioId,
                filledSize: filledSize,
                filledValue: filledValue,
                filledPrice: filledPrice,
                sizeRemaining: makerRemaining,
                tradeId: trade.tradeId,
            });
        });
    }
    ////////////////////////////////////////////////////
    //  xact
    //  - submit new order (order or cancel) to order book
    ////////////////////////////////////////////////////
    processTransaction(orderId, assetId, tradeId, takerPortfolioId, takerDeltaUnits, takerDeltaValue, makerPortfolioId) {
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
    verifyFundsAsync(portfolioId, orderSide, orderSize, currentPrice = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            // verify that portfolio exists.
            const portfolio = yield this.portfolioRepository.getDetailAsync(portfolioId);
            if (!portfolio) {
                const msg = `Order Failed - input portfolioId not registered (${portfolio})`;
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
                    throw new __1.InsufficientBalance(msg);
                }
            }
        });
    }
}
exports.ExchangeService = ExchangeService;
