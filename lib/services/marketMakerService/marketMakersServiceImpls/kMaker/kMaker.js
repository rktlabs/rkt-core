// 'use strict'
// export class KMaker extends MarketMakerServiceBase {
//     async processOrderImpl(orderSide: string, orderSize: number) {
//         ////////////////////////////////////////////////////////
//         // Process the order
//         ////////////////////////////////////////////////////////
//         // for bid (a buy) I'm "removing" units from the pool, so flip sign
//         const signedOrderSize = orderSide === 'ask' ? orderSize * -1 : orderSize
//         const taken = this.processAMMOrderImpl(signedOrderSize)
//         if (taken) {
//             const data = taken.stateUpdate
//             await this.marketMakerRepository.updateMakerStateAsync(this.assetId, data)
//             return taken
//         } else {
//             return null
//         }
//     }
//     ////////////////////////////////////////////////////////
//     // PRIVATE
//     ////////////////////////////////////////////////////////
//     private processAMMOrderImpl(signedTakerOrderSize: number): TMakerResult | null {
//         const makerParams = this.params as TKMakerParams
//         if (!makerParams) {
//             return null
//         }
//         const { propsUpdate } = this.computePropsUpdate(makerParams, signedTakerOrderSize)
//         const stateUpdate = {
//             ['params.poolCoins']: FieldValue.increment(propsUpdate.poolCoinDelta),
//             ['params.poolUnits']: FieldValue.increment(propsUpdate.poolUnitDelta),
//             ['params.k']: FieldValue.increment(propsUpdate.kDelta),
//             ['madeUnits']: FieldValue.increment(propsUpdate.madeUnitsDelta),
//             ['currentPrice']: propsUpdate.currentPrice,
//         }
//         return {
//             makerDeltaUnits: propsUpdate.poolUnitDelta,
//             makerDeltaValue: propsUpdate.poolCoinDelta,
//             stateUpdate: stateUpdate,
//         }
//     }
//     private computePropsUpdate(marketMaker: TKMakerParams, orderSize: number) {
//         const initialPoolUnits = marketMaker.poolUnits
//         const initialPoolCoins = marketMaker.poolCoins
//         const k = marketMaker.k
//         let makerPoolUnitDelta = orderSize
//         if (makerPoolUnitDelta < 0) {
//             const makerSizeRemaining = (initialPoolUnits - 1) * -1 // NOTE: Can't take last unit
//             makerPoolUnitDelta = Math.max(orderSize, makerSizeRemaining)
//         }
//         const newMakerPoolUnits = round4(initialPoolUnits - makerPoolUnitDelta)
//         const newMakerPoolCoins = round4(k / newMakerPoolUnits) // maintain constant
//         const makerPoolCoinDelta = round4(newMakerPoolCoins - initialPoolCoins)
//         const lastPrice = round4(newMakerPoolCoins / newMakerPoolUnits)
//         return {
//             propsUpdate: {
//                 poolUnitDelta: makerPoolUnitDelta * -1,
//                 poolCoinDelta: makerPoolCoinDelta,
//                 kDelta: 0,
//                 madeUnitsDelta: makerPoolUnitDelta,
//                 currentPrice: lastPrice,
//             },
//         }
//     }
// }
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
exports.KMaker = void 0;
const log4js = require("log4js");
const admin = require("firebase-admin");
const __1 = require("../../..");
const __2 = require("../../../..");
const marketMakerServiceBase_1 = require("../../marketMakerServiceBase");
const luxon_1 = require("luxon");
const FieldValue = admin.firestore.FieldValue;
const logger = log4js.getLogger('BondingCurveAMMParams');
class KMaker extends marketMakerServiceBase_1.MarketMakerServiceBase {
    constructor(assetRepository, portfolioRepository, transactionRepository, marketMakerRepository, props) {
        super(props);
        this.assetRepository = assetRepository;
        this.portfolioRepository = portfolioRepository;
        this.transactionRepository = transactionRepository;
        this.marketMakerRepository = marketMakerRepository;
        this.assetHolderRepository = new __2.AssetHolderRepository();
        this.mintService = new __1.MintService(assetRepository, portfolioRepository, transactionRepository);
    }
    static newMaker(assetRepository, portfolioRepository, transactionRepository, marketMakerRepository, config) {
        const makerProps = {
            createdAt: luxon_1.DateTime.utc().toString(),
            type: config.type,
            assetId: config.assetId,
            ownerId: config.ownerId,
            tags: config.tags,
        };
        /////////////////////////////////////////////////////////
        // create specific object type
        /////////////////////////////////////////////////////////
        const newEntity = new KMaker(assetRepository, portfolioRepository, transactionRepository, marketMakerRepository, makerProps);
        /////////////////////////////////////////////////////////
        // set initial state (params) after contstructed
        /////////////////////////////////////////////////////////
        newEntity.marketMaker.params = newEntity.computeInitialState(config.settings);
        /////////////////////////////////////////////////////////
        // compute the quote(s)
        /////////////////////////////////////////////////////////
        newEntity.marketMaker.quote = newEntity.getQuote();
        return newEntity;
    }
    processOrder(order) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.trace(`marketMaker processOrder: ${order.orderInput.sourceOrderId} for portfolio: ${order.portfolioId} asset: ${order.orderInput.assetId}`);
            const assetId = order.orderInput.assetId;
            const orderSide = order.orderInput.orderSide;
            const orderSize = order.orderInput.orderSize;
            //////////////////////////////////////////////////
            // verify that asset exists - need it to exist and have protfolioId
            //////////////////////////////////////////////////
            const asset = yield this.assetRepository.getDetailAsync(assetId);
            if (!asset) {
                const msg = `Invalid Order: Asset: ${assetId} does not exist`;
                logger.error(msg);
                throw new __2.NotFoundError(msg, { assetId });
            }
            // for this marketMaker, the asset portfolio holds the unit stock.
            const assetPortfolioId = asset.portfolioId;
            if (!assetPortfolioId) {
                const msg = `Invalid Order: Asset Portfolio: not configured for ${assetId}`;
                logger.error(msg);
                throw new __2.NotFoundError(msg);
            }
            ////////////////////////////////////////////////////////
            // Process the order
            ////////////////////////////////////////////////////////
            const processMakerTrade = yield this.processOrderImpl(assetPortfolioId, orderSide, orderSize);
            if (processMakerTrade) {
                let { orderId, makerDeltaUnits, makerDeltaValue } = processMakerTrade;
                const trade = new __2.ExchangeTrade(order);
                trade.supplyMakerSide({
                    orderId: orderId,
                    assetId: assetId,
                    portfolioId: assetPortfolioId,
                    orderSide: orderSide === 'bid' ? 'ask' : 'bid',
                    orderSize: orderSize,
                    makerDeltaUnits: makerDeltaUnits,
                    makerDeltaValue: makerDeltaValue,
                });
                logger.trace(`marketMaker trade: order: ${order.orderInput.sourceOrderId} units: ${makerDeltaUnits} value: ${makerDeltaValue}`);
                this.emitTrade(trade);
                return true;
            }
            else {
                logger.trace(`marketMaker processOrder: NO TRADE for order: ${order.orderInput.sourceOrderId}`);
                return false;
            }
        });
    }
    ////////////////////////////////////////////////////////
    // PRIVATE
    ////////////////////////////////////////////////////////
    // NOTE: Only public for testing unerlying algorithm
    processOrderImpl(assetPortfolioId, orderSide, orderSize) {
        return __awaiter(this, void 0, void 0, function* () {
            ////////////////////////////
            // verify that asset exists
            ////////////////////////////
            // this marketMaker pulls asset units from asset portfolio directly
            if (!assetPortfolioId) {
                const msg = `Invalid Order: Asset Portfolio: not configured`;
                logger.error(msg);
                throw new __2.NotFoundError(msg);
            }
            ////////////////////////////////////////////////////////
            // If asset doesn't have enough units, mint more
            ////////////////////////////////////////////////////////
            if (orderSide == 'bid' && orderSize > 0) {
                // test that asset has enough units to transact
                const assetPortfolioHoldings = yield this.assetHolderRepository.getDetailAsync(this.marketMaker.assetId, assetPortfolioId);
                const portfolioHoldingUnits = (0, __2.round4)((assetPortfolioHoldings === null || assetPortfolioHoldings === void 0 ? void 0 : assetPortfolioHoldings.units) || 0);
                if (portfolioHoldingUnits < orderSize) {
                    const delta = orderSize - portfolioHoldingUnits;
                    const value = this.computePrice(delta);
                    // not enough. mint me sonme
                    yield this.mintService.mintUnits(this.marketMaker.assetId, delta, value);
                }
            }
            ////////////////////////////////////////////////////////
            // Process the order
            ////////////////////////////////////////////////////////
            // for bid (a buy) I'm "removing" units from the pool, so flip sign
            const signedTakerOrderSize = orderSide === 'ask' ? orderSize * -1 : orderSize;
            const taken = this.processOrderSize(signedTakerOrderSize);
            if (taken) {
                yield this.marketMakerRepository.updateMakerStateAsync(this.marketMaker.assetId, taken.stateUpdate);
                return taken;
            }
            else {
                return null;
            }
        });
    }
    // // NOTE: Only public for testing unerlying algorithm
    // // positive order size - buy from marketMaker
    // // negative order size - sel to marketMaker
    // processOrderSize(signedTakerOrderSize: number) {
    //     const makerParams = this.marketMaker.params as BondingCurveAMMParams
    //     if (!makerParams) {
    //         const msg = `Error: MarketMaker Parms not available: ${this.marketMaker.assetId}`
    //         logger.error(msg)
    //         throw new ConflictError(msg)
    //     }
    //     let makerDeltaUnits = 0
    //     let makerDeltaValue = 0
    //     if (signedTakerOrderSize >= 0) {
    //         // this is a buy so makerDeltaUnits should be negative - units leaving marketMaker
    //         // and makerDeltaValue should be positive - value added to marketMaker
    //         makerDeltaUnits = signedTakerOrderSize * -1
    //         makerDeltaValue = this.computePrice(signedTakerOrderSize)
    //     } else {
    //         // this is a sell-back - so limited to number of units ever made
    //         const limitedTakeSize = Math.max(signedTakerOrderSize, this.marketMaker.params.madeUnits * -1)
    //         makerDeltaUnits = limitedTakeSize * -1
    //         makerDeltaValue = this.computeValue(makerDeltaUnits) * -1
    //     }
    //     /////////////////////////////////////////////////////////
    //     // compute marketMaker update(s)
    //     /////////////////////////////////////////////////////////
    //     this.marketMaker.params.madeUnits += makerDeltaUnits * -1
    //     this.marketMaker.params.cumulativeValue += makerDeltaValue
    //     /////////////////////////////////////////////////////////
    //     // compute the quote(s)
    //     /////////////////////////////////////////////////////////
    //     const units = Math.abs(makerDeltaUnits)
    //     const value = Math.abs(makerDeltaValue)
    //     const last: TExchangeQuoteLast = {
    //         side: makerDeltaUnits < 0 ? 'bid' : 'ask',
    //         units: units,
    //         value: value,
    //         unitValue: units === 0 ? 0 : Math.abs(round4(value / units)),
    //     }
    //     this.marketMaker.quote = this.getQuote(last)
    //     this.emitQuote(this.marketMaker.quote)
    //     // NOTE: made units is inverse of "delta Units". It counts up for each buy
    //     // NOTE: Each marketMaker type has it's own way to "update" the persistent marketMaker state
    //     // so construct that here (the FieldValue does an atomic add to value.)
    //     const stateUpdate = {
    //         ['params.madeUnits']: FieldValue.increment(makerDeltaUnits * -1),
    //         ['params.cumulativeValue']: FieldValue.increment(makerDeltaValue),
    //         quote: this.marketMaker.quote,
    //     }
    //     const result: TMakerResult = {
    //         makerDeltaUnits: makerDeltaUnits,
    //         makerDeltaValue: makerDeltaValue,
    //         stateUpdate: stateUpdate,
    //     }
    //     return result
    // }
    processOrderSize(signedTakerOrderSize) {
        const makerParams = this.marketMaker.params;
        if (!makerParams) {
            return null;
        }
        const { propsUpdate } = this.computePropsUpdate(makerParams, signedTakerOrderSize);
        const stateUpdate = {
            ['params.poolCoins']: FieldValue.increment(propsUpdate.poolCoinDelta),
            ['params.poolUnits']: FieldValue.increment(propsUpdate.poolUnitDelta),
            ['params.k']: FieldValue.increment(propsUpdate.kDelta),
            ['madeUnits']: FieldValue.increment(propsUpdate.madeUnitsDelta),
            ['currentPrice']: propsUpdate.currentPrice,
        };
        return {
            makerDeltaUnits: propsUpdate.poolUnitDelta,
            makerDeltaValue: propsUpdate.poolCoinDelta,
            stateUpdate: stateUpdate,
        };
    }
    computePropsUpdate(marketMaker, orderSize) {
        const initialPoolUnits = marketMaker.poolUnits;
        const initialPoolCoins = marketMaker.poolCoins;
        // const k = marketMaker.k
        const k = initialPoolUnits * initialPoolCoins;
        let makerPoolUnitDelta = orderSize;
        if (makerPoolUnitDelta < 0) {
            const makerSizeRemaining = (initialPoolUnits - 1) * -1; // NOTE: Can't take last unit
            makerPoolUnitDelta = Math.max(orderSize, makerSizeRemaining);
        }
        const newMakerPoolUnits = (0, __2.round4)(initialPoolUnits - makerPoolUnitDelta);
        const newMakerPoolCoins = (0, __2.round4)(k / newMakerPoolUnits); // maintain constant
        const makerPoolCoinDelta = (0, __2.round4)(newMakerPoolCoins - initialPoolCoins);
        const lastPrice = (0, __2.round4)(newMakerPoolCoins / newMakerPoolUnits);
        return {
            propsUpdate: {
                poolUnitDelta: makerPoolUnitDelta * -1,
                poolCoinDelta: makerPoolCoinDelta,
                kDelta: 0,
                madeUnitsDelta: makerPoolUnitDelta,
                currentPrice: lastPrice,
            },
        };
    }
    ////////////////////////////////////////////////////////
    // Bonding function
    ////////////////////////////////////////////////////////
    getQuote(last) {
        const quote = {
            assetId: this.marketMaker.assetId,
            ask: this.computePrice(),
            ask10: this.computePrice(10) / 10,
            spot: this.spotPrice(),
            bid: this.marketMaker.params.madeUnits >= 1 ? this.computeValue(1) / 1 : NaN,
            bid10: this.marketMaker.params.madeUnits >= 10 ? this.computeValue(10) / 10 : NaN,
        };
        if (last)
            quote.last = last;
        return quote;
    }
    //////////////////////////////////////////
    // the current price point
    spotPrice() {
        return this._currentPriceFunction(this.marketMaker.params.madeUnits);
    }
    //////////////////////////////////////////
    // the price to purchase units (default to 1)
    computePrice(units = 1) {
        return this._deltaValueFunction(units);
    }
    //////////////////////////////////////////
    // the value to sell units (default to 1)
    computeValue(units = 1) {
        return -1.0 * this._deltaValueFunction(-1.0 * units);
    }
    //////////////////////////////////////////
    // the current price point of transaction at 'epsilon'
    // (the bonding curven evaluated at x)
    _currentPriceFunction(x) {
        x = Math.max(x, 0);
        const val = this.marketMaker.params.m * Math.pow(x, this.marketMaker.params.e) + this.marketMaker.params.y0;
        return val;
    }
    //////////////////////////////////////////
    // the total value of x units
    // (area under the bonding curve from 0 to x)
    _totalValueFunction(x) {
        x = Math.max(x, 0);
        const inc = this.marketMaker.params.e + 1.0;
        const val = (this.marketMaker.params.m * Math.pow(x, inc)) / inc + this.marketMaker.params.y0 * x;
        return val;
    }
    //////////////////////////////////////////
    // the value of x units if applie right now - x is signed
    // (the area under bonding curve from current x to  +/- some delta)
    _deltaValueFunction(delta_units) {
        const cost = this._totalValueFunction(this.marketMaker.params.madeUnits + delta_units) -
            this._totalValueFunction(this.marketMaker.params.madeUnits);
        return cost;
    }
    computeInitialState(settings) {
        const initMadeUnits = (settings === null || settings === void 0 ? void 0 : settings.initialUnits) || 0;
        const initPrice = (settings === null || settings === void 0 ? void 0 : settings.initialPrice) || 1;
        const initialPoolUnits = (settings === null || settings === void 0 ? void 0 : settings.initialPoolUnits) || 1000;
        const poolUnits = initialPoolUnits - initMadeUnits;
        const poolCoins = poolUnits * initPrice;
        const makerState = {
            madeUnits: (settings === null || settings === void 0 ? void 0 : settings.initialUnits) || 0,
            cumulativeValue: (settings === null || settings === void 0 ? void 0 : settings.initialValue) || 0,
            x0: settings.initialPoolUnits,
            poolUnits: poolUnits,
            poolCoins: poolCoins,
        };
        return makerState;
    }
}
exports.KMaker = KMaker;
