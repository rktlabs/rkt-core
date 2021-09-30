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
exports.BondingCurveAMM = void 0;
const log4js = require("log4js");
const admin = require("firebase-admin");
const __1 = require("../../..");
const __2 = require("../../../..");
const marketMakerServiceBase_1 = require("../../marketMakerServiceBase");
const FieldValue = admin.firestore.FieldValue;
const logger = log4js.getLogger('BondingCurveAMMParams');
class BondingCurveAMM extends marketMakerServiceBase_1.MarketMakerServiceBase {
    constructor(assetRepository, portfolioRepository, transactionRepository, marketMakerRepository, props) {
        super(props);
        this.assetRepository = assetRepository;
        this.portfolioRepository = portfolioRepository;
        this.transactionRepository = transactionRepository;
        this.marketMakerRepository = marketMakerRepository;
        this.assetHolderRepository = new __2.AssetHolderRepository();
        this.mintService = new __1.MintService(assetRepository, portfolioRepository, transactionRepository);
    }
    processOrder(order) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.trace(`marketMaker processOrder: ${order.orderSource.sourceOrderId} for portfolio: ${order.portfolioId} asset: ${order.orderSource.assetId}`);
            const assetId = order.orderSource.assetId;
            const orderSide = order.orderSource.orderSide;
            const orderSize = order.orderSource.orderSize;
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
                logger.trace(`marketMaker trade: order: ${order.orderSource.sourceOrderId} units: ${makerDeltaUnits} value: ${makerDeltaValue}`);
                this.emitTrade(trade);
                return true;
            }
            else {
                logger.trace(`marketMaker processOrder: NO TRADE for order: ${order.orderSource.sourceOrderId}`);
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
                    // not enough. mint me sonme
                    yield this.mintService.mintUnits(this.marketMaker.assetId, delta);
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
    // NOTE: Only public for testing unerlying algorithm
    // positive order size - buy from marketMaker
    // negative order size - sel to marketMaker
    processOrderSize(signedTakerOrderSize) {
        const makerParams = this.marketMaker.params;
        if (!makerParams) {
            const msg = `Error: MarketMaker Parms not available: ${this.marketMaker.assetId}`;
            logger.error(msg);
            throw new __2.ConflictError(msg);
        }
        let makerDeltaUnits = 0;
        let makerDeltaValue = 0;
        if (signedTakerOrderSize >= 0) {
            // this is a buy so makerDeltaUnits should be negative - units leaving marketMaker
            // and makerDeltaValue should be positive - value added to marketMaker
            makerDeltaUnits = signedTakerOrderSize * -1;
            makerDeltaValue = this.computePrice(signedTakerOrderSize);
        }
        else {
            // this is a sell-back - so limited to number of units ever made
            const limitedTakeSize = Math.max(signedTakerOrderSize, this.marketMaker.params.madeUnits * -1);
            makerDeltaUnits = limitedTakeSize * -1;
            makerDeltaValue = this.computeValue(makerDeltaUnits) * -1;
        }
        /////////////////////////////////////////////////////////
        // compute marketMaker update(s)
        /////////////////////////////////////////////////////////
        this.marketMaker.params.madeUnits += makerDeltaUnits * -1;
        this.marketMaker.params.cumulativeValue += makerDeltaValue;
        /////////////////////////////////////////////////////////
        // compute the quote(s)
        /////////////////////////////////////////////////////////
        const units = Math.abs(makerDeltaUnits);
        const value = Math.abs(makerDeltaValue);
        const last = {
            side: makerDeltaUnits < 0 ? 'bid' : 'ask',
            units: units,
            value: value,
            unitValue: units === 0 ? 0 : Math.abs((0, __2.round4)(value / units)),
        };
        this.marketMaker.quote = this.getQuote(last);
        this.emitQuote(this.marketMaker.quote);
        // NOTE: made units is inverse of "delta Units". It counts up for each buy
        // NOTE: Each marketMaker type has it's own way to "update" the persistent marketMaker state
        // so construct that here (the FieldValue does an atomic add to value.)
        const stateUpdate = {
            ['params.madeUnits']: FieldValue.increment(makerDeltaUnits * -1),
            ['params.cumulativeValue']: FieldValue.increment(makerDeltaValue),
            quote: this.marketMaker.quote,
        };
        const result = {
            makerDeltaUnits: makerDeltaUnits,
            makerDeltaValue: makerDeltaValue,
            stateUpdate: stateUpdate,
        };
        return result;
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
}
exports.BondingCurveAMM = BondingCurveAMM;
