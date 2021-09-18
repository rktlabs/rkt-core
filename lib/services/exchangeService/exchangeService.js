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
        this.portfolioHoldingRepository = new __1.PortfolioHoldingRepository();
        this.portfolioRepository = new __1.PortfolioRepository();
        this.exchangeOrderRepository = new __1.ExchangeOrderRepository();
        this.exchangeTradeRepository = new __1.ExchangeTradeRepository();
        this.exchangeQuoteRepository = new __1.ExchangeQuoteRepository();
        this.transactionService = new __1.TransactionService();
        this.makerFactoryService = new __1.MakerService();
    }
    ////////////////////////////////////////////////////
    //  handleNewExchangeOrderAsync
    //  - new order handler - accepts raw json as input
    ////////////////////////////////////////////////////
    handleNewExchangeOrderAsync(orderPayload) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.debug(`Handle Exchange Order: ${JSON.stringify(orderPayload)}`);
            let exchangeOrder;
            try {
                // save order
                exchangeOrder = __1.ExchangeOrder.newExchangeOrder(orderPayload);
                ////////////////////////////////////
                // order is reasonably complete so mark it as received
                // and STORE it
                ////////////////////////////////////
                exchangeOrder.status = 'received';
                yield this.exchangeOrderRepository.storeAsync(exchangeOrder);
                ////////////////////////////////////
                // Verify source portfolio has adequate funds/units to complete transaction
                ////////////////////////////////////
                if (exchangeOrder.orderSide === 'bid') {
                    yield this.verifyAssetsAsync(exchangeOrder);
                }
                else if (exchangeOrder.orderSide === 'ask') {
                    ////////////////////////////
                    // get bid price and verify funds
                    ////////////////////////////
                    const quote = yield this.exchangeQuoteRepository.getDetailAsync(exchangeOrder.assetId);
                    const bid = (quote === null || quote === void 0 ? void 0 : quote.bid) || 1;
                    yield this.verifyFundsAsync(exchangeOrder, bid);
                }
                // verify that maker exists.
                const orderId = exchangeOrder.orderId;
                const orderSide = exchangeOrder.orderSide;
                const orderSize = exchangeOrder.orderSize;
                const order = new _1.MarketOrder({
                    assetId: exchangeOrder.assetId,
                    orderId: exchangeOrder.orderId,
                    portfolioId: exchangeOrder.portfolioId,
                    orderSide: orderSide,
                    orderSize: orderSize,
                });
                ////////////////////////////////////////////////////////
                // Process the order
                ////////////////////////////////////////////////////////
                const maker = yield this.makerFactoryService.getMakerAsync(exchangeOrder.assetId);
                if (maker) {
                    const trade = yield maker.processOrder(maker, order);
                    if (trade) {
                        if (trade.taker.filledSize) {
                            yield this.onFill(trade.taker);
                            yield this.onTrade(trade);
                            const takerPortfolioId = trade.taker.portfolioId;
                            const takerDeltaUnits = trade.taker.filledSize;
                            const takerDeltaValue = trade.taker.filledValue;
                            const makerPortfolioId = trade.makers[0].portfolioId;
                            yield this.xact(orderId, exchangeOrder.assetId, trade.tradeId, takerPortfolioId, takerDeltaUnits, takerDeltaValue, makerPortfolioId);
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
    //  submitOrderToBook
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
    verifyAssetsAsync(exchangeOrder) {
        return __awaiter(this, void 0, void 0, function* () {
            // verify that portfolio exists.
            const orderPortfolioId = exchangeOrder.portfolioId;
            const exchangeOrderPortfolio = yield this.portfolioRepository.getDetailAsync(orderPortfolioId);
            if (!exchangeOrderPortfolio) {
                const msg = `Exchange Order Failed - input portfolioId not registered (${orderPortfolioId})`;
                throw new __1.ConflictError(msg, { exchangeOrder });
            }
            const portfolioId = exchangeOrder.portfolioId;
            const assetId = exchangeOrder.assetId;
            const unitsRequired = exchangeOrder.orderSide === 'ask' ? (0, __1.round4)(exchangeOrder.orderSize) : 0;
            if (unitsRequired > 0) {
                const portfolioHoldings = yield this.portfolioHoldingRepository.getDetailAsync(portfolioId, assetId);
                const portfolioHoldingUnits = (0, __1.round4)((portfolioHoldings === null || portfolioHoldings === void 0 ? void 0 : portfolioHoldings.units) || 0);
                if (portfolioHoldingUnits < unitsRequired) {
                    // exception
                    const msg = ` portfolio: [${portfolioId}] asset holding: [${assetId}] has: [${portfolioHoldingUnits}] of required: [${unitsRequired}] `;
                    throw new __1.InsufficientBalance(msg, { payload: exchangeOrder });
                }
            }
        });
    }
    verifyFundsAsync(exchangeOrder, price) {
        return __awaiter(this, void 0, void 0, function* () {
            // verify that portfolio exists.
            const orderPortfolioId = exchangeOrder.portfolioId;
            const exchangeOrderPortfolio = yield this.portfolioRepository.getDetailAsync(orderPortfolioId);
            if (!exchangeOrderPortfolio) {
                const msg = `Exchange Order Failed - input portfolioId not registered (${orderPortfolioId})`;
                throw new __1.ConflictError(msg, { exchangeOrder });
            }
            const COIN_BUFFER_FACTOR = 1.05;
            const portfolioId = exchangeOrder.portfolioId;
            const paymentAssetId = 'coin::rkt';
            const coinsRequired = exchangeOrder.orderSide === 'bid' ? (0, __1.round4)(exchangeOrder.orderSize * price) * COIN_BUFFER_FACTOR : 0;
            if (coinsRequired > 0) {
                const coinsHeld = yield this.portfolioHoldingRepository.getDetailAsync(portfolioId, paymentAssetId);
                const portfolioHoldingUnits = (0, __1.round4)((coinsHeld === null || coinsHeld === void 0 ? void 0 : coinsHeld.units) || 0);
                if (portfolioHoldingUnits < coinsRequired) {
                    // exception
                    const msg = ` portfolio: [${portfolioId}] coin holding: [${paymentAssetId}] has: [${portfolioHoldingUnits}] of required: [${coinsRequired}] `;
                    throw new __1.InsufficientBalance(msg, { payload: exchangeOrder });
                }
            }
        });
    }
}
exports.ExchangeService = ExchangeService;
