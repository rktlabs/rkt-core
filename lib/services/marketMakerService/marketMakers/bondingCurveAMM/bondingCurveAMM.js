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
const __1 = require("../..");
const __2 = require("../../..");
const __3 = require("../../../..");
const FieldValue = admin.firestore.FieldValue;
const logger = log4js.getLogger('BondingCurveAMMParams');
class BondingCurveAMM extends __1.MarketMakerBase {
    constructor(assetRepository, portfolioRepository, transactionRepository, marketMakerRepository, props) {
        super(props);
        this.assetRepository = assetRepository;
        this.portfolioRepository = portfolioRepository;
        this.transactionRepository = transactionRepository;
        this.marketMakerRepository = marketMakerRepository;
        this.assetHolderRepository = new __3.AssetHolderRepository();
        this.mintService = new __2.MintService(assetRepository, portfolioRepository, transactionRepository);
    }
    processOrder(order) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.trace(`marketMaker processOrder: ${order.orderId} for portfolio: ${order.portfolioId} asset: ${order.assetId}`);
            const assetId = order.assetId;
            const orderSide = order.orderSide;
            const orderSize = order.orderSize;
            //////////////////////////////////////////////////
            // verify that asset exists - need it to exist and have protfolioId
            //////////////////////////////////////////////////
            const asset = yield this.assetRepository.getDetailAsync(assetId);
            if (!asset) {
                const msg = `Invalid Order: Asset: ${assetId} does not exist`;
                logger.error(msg);
                throw new __3.NotFoundError(msg, { assetId });
            }
            // for this marketMaker, the asset portfolio holds the unit stock.
            const assetPortfolioId = asset.portfolioId;
            if (!assetPortfolioId) {
                const msg = `Invalid Order: Asset Portfolio: not configured for ${assetId}`;
                logger.error(msg);
                throw new __3.NotFoundError(msg);
            }
            ////////////////////////////////////////////////////////
            // Process the order
            ////////////////////////////////////////////////////////
            const processMakerTrade = yield this.processOrderImpl(assetPortfolioId, orderSide, orderSize);
            if (processMakerTrade) {
                let { orderId, makerDeltaUnits, makerDeltaValue } = processMakerTrade;
                const trade = new __3.ExchangeTrade(order);
                trade.supplyMakerSide({
                    orderId: orderId,
                    assetId: assetId,
                    portfolioId: assetPortfolioId,
                    orderSide: orderSide === 'bid' ? 'ask' : 'bid',
                    orderSize: orderSize,
                    makerDeltaUnits: makerDeltaUnits,
                    makerDeltaValue: makerDeltaValue,
                });
                logger.trace(`marketMaker trade: order: ${order.orderId} units: ${makerDeltaUnits} value: ${makerDeltaValue}`);
                this.emitTrade(trade);
                //return trade
                return true;
            }
            else {
                logger.trace(`marketMaker processOrder: NO TRADE for order: ${order.orderId}`);
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
            // const asset = await this.resolveAssetSpec(this.assetId)
            // this marketMaker pulls asset units from asset portfolio directly
            if (!assetPortfolioId) {
                const msg = `Invalid Order: Asset Portfolio: not configured`;
                logger.error(msg);
                throw new __3.NotFoundError(msg);
            }
            ////////////////////////////////////////////////////////
            // If asset doesn't have enough units, mint more
            ////////////////////////////////////////////////////////
            if (orderSide == 'bid' && orderSize > 0) {
                // test that asset has enough units to transact
                const assetPortfolioHoldings = yield this.assetHolderRepository.getDetailAsync(this.assetId, assetPortfolioId);
                const portfolioHoldingUnits = (0, __3.round4)((assetPortfolioHoldings === null || assetPortfolioHoldings === void 0 ? void 0 : assetPortfolioHoldings.units) || 0);
                if (portfolioHoldingUnits < orderSize) {
                    const delta = orderSize - portfolioHoldingUnits;
                    // not enough. mint me sonme
                    yield this.mintService.mintUnits(this.assetId, delta);
                }
            }
            ////////////////////////////////////////////////////////
            // Process the order
            ////////////////////////////////////////////////////////
            // for bid (a buy) I'm "removing" units from the pool, so flip sign
            const signedTakerOrderSize = orderSide === 'ask' ? orderSize * -1 : orderSize;
            const taken = this.processOrderSize(signedTakerOrderSize);
            if (taken) {
                yield this.marketMakerRepository.updateMakerStateAsync(this.assetId, taken.stateUpdate);
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
        const makerParams = this.params;
        if (!makerParams) {
            const msg = `Error: MarketMaker Parms not available: ${this.assetId}`;
            logger.error(msg);
            throw new __3.ConflictError(msg);
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
            const limitedTakeSize = Math.max(signedTakerOrderSize, this.params.madeUnits * -1);
            makerDeltaUnits = limitedTakeSize * -1;
            makerDeltaValue = this.computeValue(makerDeltaUnits) * -1;
        }
        /////////////////////////////////////////////////////////
        // compute marketMaker update(s)
        /////////////////////////////////////////////////////////
        this.params.madeUnits += makerDeltaUnits * -1;
        this.params.cumulativeValue += makerDeltaValue;
        /////////////////////////////////////////////////////////
        // compute the quote(s)
        /////////////////////////////////////////////////////////
        const units = Math.abs(makerDeltaUnits);
        const value = Math.abs(makerDeltaValue);
        const last = {
            side: makerDeltaUnits < 0 ? 'bid' : 'ask',
            units: units,
            value: value,
            unitValue: units === 0 ? 0 : Math.abs((0, __3.round4)(value / units)),
        };
        this.quote = this.getQuote(last);
        this.emitQuote(this.quote);
        // NOTE: made units is inverse of "delta Units". It counts up for each buy
        // NOTE: Each marketMaker type has it's own way to "update" the persistent marketMaker state
        // so construct that here (the FieldValue does an atomic add to value.)
        const stateUpdate = {
            ['params.madeUnits']: FieldValue.increment(makerDeltaUnits * -1),
            ['params.cumulativeValue']: FieldValue.increment(makerDeltaValue),
            quote: this.quote,
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
            assetId: this.assetId,
            ask: this.computePrice(),
            ask10: this.computePrice(10) / 10,
            spot: this.spotPrice(),
            bid: this.params.madeUnits >= 1 ? this.computeValue(1) / 1 : NaN,
            bid10: this.params.madeUnits >= 10 ? this.computeValue(10) / 10 : NaN,
        };
        if (last)
            quote.last = last;
        return quote;
    }
    //////////////////////////////////////////
    // the current price point
    spotPrice() {
        return this._currentPriceFunction(this.params.madeUnits);
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
        const val = this.params.m * Math.pow(x, this.params.e) + this.params.y0;
        return val;
    }
    //////////////////////////////////////////
    // the total value of x units
    // (area under the bonding curve from 0 to x)
    _totalValueFunction(x) {
        x = Math.max(x, 0);
        const inc = this.params.e + 1.0;
        const val = (this.params.m * Math.pow(x, inc)) / inc + this.params.y0 * x;
        return val;
    }
    //////////////////////////////////////////
    // the value of x units if applie right now - x is signed
    // (the area under bonding curve from current x to  +/- some delta)
    _deltaValueFunction(delta_units) {
        const cost = this._totalValueFunction(this.params.madeUnits + delta_units) -
            this._totalValueFunction(this.params.madeUnits);
        return cost;
    }
}
exports.BondingCurveAMM = BondingCurveAMM;
