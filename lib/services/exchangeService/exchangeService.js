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
class ExchangeService {
    constructor(eventPublisher) {
        ////////////////////////////////////////////////////
        //  onTrade
        //  - store trade
        //  - publish trade to clearing house
        ////////////////////////////////////////////////////
        this.onTrade = (trade) => __awaiter(this, void 0, void 0, function* () {
            // logger.debug('onTrade: %o', trade)
            yield this.exchangeTradeRepository.storeAsync(trade); // async - don't wait to finish
            this.eventPublisher.publishOrderEventCompleteAsync(trade.taker.portfolioId, trade.taker.orderId, trade.tradeId, 'marketMaker'); // async - don't wait to finish
        });
        ////////////////////////////////////////////////////
        //  onUpdateQuote
        //  - store new quoted for the asset indicated
        ////////////////////////////////////////////////////
        this.onUpdateQuote = (trade, bid, ask) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const timeAtNow = luxon_1.DateTime.utc().toString();
            const event = {
                assetId: trade.assetId,
                quoteAt: timeAtNow,
                bid,
                ask,
                lastTrade: {
                    side: trade.taker.orderSide,
                    volume: Math.abs(trade.taker.filledSize),
                    price: trade.taker.filledPrice,
                    executedAt: trade.executedAt,
                },
            };
            //logger.debug('onUpdateQuote: %o', event)
            const assetId = event.assetId;
            // const bid = event.bid
            // const ask = event.ask
            const last = ((_a = event.lastTrade) === null || _a === void 0 ? void 0 : _a.price) || 0;
            const updateProps = { bid, ask, last };
            yield this.assetRepository.updateAsync(assetId, updateProps);
        });
        this.eventPublisher = eventPublisher || new __1.EventPublisher();
        this.assetRepository = new __1.AssetRepository();
        this.leagueRepository = new __1.LeagueRepository();
        this.portfolioHoldingsCache = new __1.PortfolioHoldingsRepository();
        this.portfolioCache = new __1.PortfolioRepository();
        this.exchangeOrderRepository = new __1.ExchangeOrderRepository();
        this.exchangeTradeRepository = new __1.ExchangeTradeRepository();
        this.transactionService = new __1.TransactionService();
        this.makerService = new __1.MakerServiceFactory();
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
                ////////////////////////////
                // verify that asset exists
                ////////////////////////////
                const assetId = exchangeOrder.assetId;
                const asset = yield this.assetRepository.getDetailAsync(assetId);
                if (!asset) {
                    const msg = `Invalid Order: Asset: ${assetId} does not exist`;
                    throw new __1.NotFoundError(msg, { assetId });
                }
                ////////////////////////////
                // verify that league exists - not sure why it matters. should always be true
                ////////////////////////////
                const leagueId = asset.leagueId;
                const league = yield this.leagueRepository.getDetailAsync(leagueId);
                if (!league) {
                    const msg = `Invalid Order: League: ${leagueId} does not exist`;
                    throw new __1.NotFoundError(msg, { leagueId });
                }
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
                    const price = (asset === null || asset === void 0 ? void 0 : asset.bid) || 0;
                    yield this.verifyFundsAsync(exchangeOrder, price);
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
                const makerPortfolioId = league.portfolioId;
                //const trade = await this.processOrder(order, makerPortfolioId)
                ///////////////////////////////////////////////////
                // create trade and fill in maker from asset pools
                const trade = new _1.Trade(order);
                const taker = trade.taker;
                // for bid (a buy) I'm "removing" units from the pool, so flip sign
                const signedTakeSize = trade.taker.orderSide === 'ask' ? taker.orderSize * -1 : taker.orderSize;
                // console.log('------------- ORDER -------------')
                // console.log(order)
                // console.log(trade)
                // console.log(`signedTakeSize: ${signedTakeSize}`)
                //const assetId = order.assetId
                const taken = yield this.makerService.takeUnits(assetId, signedTakeSize);
                if (!taken) {
                    return null;
                }
                // console.log('------------- taken -------------')
                // console.log(taken)
                const { bid, ask, makerDeltaUnits: makerDeltaUnits, makerDeltaCoins: makerDeltaCoins } = taken;
                const makerFill = new _1.MakerFill({
                    assetId: taker.assetId,
                    portfolioId: makerPortfolioId,
                    orderSide: taker.orderSide === 'bid' ? 'ask' : 'bid',
                    orderSize: taker.orderSize,
                });
                trade.fillMaker(makerFill, makerDeltaUnits, makerDeltaCoins);
                if (trade.taker.filledSize !== 0) {
                    yield this.onFill(trade.taker);
                    yield this.onTrade(trade);
                    yield this.onUpdateQuote(trade, bid, ask);
                }
                if (trade) {
                    const makerPortfolioId = league.portfolioId;
                    if (trade.taker.filledSize) {
                        const takerPortfolioId = trade.taker.portfolioId;
                        const takerDeltaUnits = trade.taker.filledSize;
                        const takerDeltaValue = trade.taker.filledValue;
                        yield this.xact(orderId, assetId, trade.tradeId, takerPortfolioId, takerDeltaUnits, takerDeltaValue, makerPortfolioId);
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
                    this.eventPublisher.publishOrderEventFailedAsync(exchangeOrder.portfolioId, exchangeOrder.orderId, reason, 'marketMaker'); // async - don't wait to finish
                }
                throw error;
            }
            return exchangeOrder;
        });
    }
    processOrder(order, makerPortfolioId) {
        return __awaiter(this, void 0, void 0, function* () {
            ///////////////////////////////////////////////////
            // create trade and fill in maker from asset pools
            const trade = new _1.Trade(order);
            const taker = trade.taker;
            // for bid (a buy) I'm "removing" units from the pool, so flip sign
            const signedTakeSize = trade.taker.orderSide === 'ask' ? taker.orderSize * -1 : taker.orderSize;
            const assetId = order.assetId;
            const taken = yield this.makerService.takeUnits(assetId, signedTakeSize);
            if (!taken) {
                return null;
            }
            const { bid, ask, makerDeltaUnits, makerDeltaCoins } = taken;
            const makerFill = new _1.MakerFill({
                assetId: taker.assetId,
                portfolioId: makerPortfolioId,
                orderSide: taker.orderSide === 'bid' ? 'ask' : 'bid',
                orderSize: taker.orderSize,
            });
            trade.fillMaker(makerFill, makerDeltaUnits, makerDeltaCoins);
            if (trade.taker.filledSize !== 0) {
                yield this.onFill(trade.taker);
                yield this.onTrade(trade);
                yield this.onUpdateQuote(trade, bid, ask);
            }
            return trade;
        });
    }
    ////////////////////////////////////////////////////
    //  onFill
    //  - handle order fill resulting from trade
    ////////////////////////////////////////////////////
    onFill(taker) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = {
                assetId: taker.assetId,
                orderId: taker.orderId,
                portfolioId: taker.portfolioId,
                orderType: taker.orderType,
                orderSide: taker.orderSide,
                orderSize: taker.orderSize,
                sizeRemaining: taker.sizeRemaining,
                tags: taker.tags,
                filledSize: taker.filledSize,
                filledValue: taker.filledValue,
                filledPrice: taker.filledPrice,
                isPartial: taker.isPartial,
                isClosed: taker.isClosed,
            };
            //logger.debug('onFill: %o', event)
            const orderId = event.orderId;
            const portfolioId = event.portfolioId;
            const filledSize = event.filledSize;
            const filledValue = event.filledValue;
            const filledPrice = event.filledPrice;
            const makerRemaining = event.sizeRemaining;
            this.eventPublisher.publishOrderEventFillAsync(portfolioId, orderId, filledSize, filledValue, filledPrice, makerRemaining, 'marketMaker'); // async - don't wait to finish
            const newMakerStatus = event.isClosed ? 'filled' : 'partial';
            const newMakerState = !event.isClosed && event.sizeRemaining > 0 ? 'open' : 'closed';
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
            // console.log(`takerPortfolioId: ${takerPortfolioId} `)
            // console.log(`takerDeltaUnits: ${takerDeltaUnits} `)
            // console.log(`takerDeltaValue: ${takerDeltaValue} `)
            // console.log(`makerPortfolioId: ${makerPortfolioId} `)
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
                            assetId: 'coin::fantx',
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
                            assetId: 'coin::fantx',
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
                // takerDeltaUnits < 0 ( an ask/sale )
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
                            assetId: 'coin::fantx',
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
                            assetId: 'coin::fantx',
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
            // logger.debug('Transaction: ', newTransactionData)
            return this.transactionService.newTransactionAsync(newTransactionData);
        });
    }
    verifyAssetsAsync(exchangeOrder) {
        return __awaiter(this, void 0, void 0, function* () {
            // verify that portfolio exists.
            const orderPortfolioId = exchangeOrder.portfolioId;
            const exchangeOrderPortfolio = yield this.portfolioCache.getDetailAsync(orderPortfolioId);
            if (!exchangeOrderPortfolio) {
                const msg = `Exchange Order Failed - input portfolioId not registered (${orderPortfolioId})`;
                throw new __1.ConflictError(msg, { exchangeOrder });
            }
            const portfolioId = exchangeOrder.portfolioId;
            const assetId = exchangeOrder.assetId;
            const unitsRequired = exchangeOrder.orderSide === 'ask' ? (0, __1.round4)(exchangeOrder.orderSize) : 0;
            if (unitsRequired > 0) {
                const portfolioHoldings = yield this.portfolioHoldingsCache.getDetailAsync(portfolioId, assetId);
                const portfolioHoldingsUnits = (0, __1.round4)((portfolioHoldings === null || portfolioHoldings === void 0 ? void 0 : portfolioHoldings.units) || 0);
                if (portfolioHoldingsUnits < unitsRequired) {
                    // exception
                    const msg = ` portfolio: [${portfolioId}] asset holding: [${assetId}] has: [${portfolioHoldingsUnits}] of required: [${unitsRequired}] `;
                    throw new __1.InsufficientBalance(msg, { payload: exchangeOrder });
                }
            }
        });
    }
    verifyFundsAsync(exchangeOrder, price) {
        return __awaiter(this, void 0, void 0, function* () {
            // verify that portfolio exists.
            const orderPortfolioId = exchangeOrder.portfolioId;
            const exchangeOrderPortfolio = yield this.portfolioCache.getDetailAsync(orderPortfolioId);
            if (!exchangeOrderPortfolio) {
                const msg = `Exchange Order Failed - input portfolioId not registered (${orderPortfolioId})`;
                throw new __1.ConflictError(msg, { exchangeOrder });
            }
            const COIN_BUFFER_FACTOR = 1.05;
            const portfolioId = exchangeOrder.portfolioId;
            const paymentAssetId = 'coin::fantx';
            const coinsRequired = exchangeOrder.orderSide === 'bid' ? (0, __1.round4)(exchangeOrder.orderSize * price) * COIN_BUFFER_FACTOR : 0;
            if (coinsRequired > 0) {
                const coinsHeld = yield this.portfolioHoldingsCache.getDetailAsync(portfolioId, paymentAssetId);
                const portfolioHoldingsUnits = (0, __1.round4)((coinsHeld === null || coinsHeld === void 0 ? void 0 : coinsHeld.units) || 0);
                if (portfolioHoldingsUnits < coinsRequired) {
                    // exception
                    const msg = ` portfolio: [${portfolioId}] coin holding: [${paymentAssetId}] has: [${portfolioHoldingsUnits}] of required: [${coinsRequired}] `;
                    throw new __1.InsufficientBalance(msg, { payload: exchangeOrder });
                }
            }
        });
    }
}
exports.ExchangeService = ExchangeService;
