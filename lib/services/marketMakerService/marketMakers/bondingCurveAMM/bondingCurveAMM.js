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
const luxon_1 = require("luxon");
const __1 = require("../..");
const __2 = require("../../..");
const __3 = require("../../../..");
const admin = require("firebase-admin");
const FieldValue = admin.firestore.FieldValue;
class BondingCurveAMM extends __1.MarketMakerBase {
    constructor(assetRepository, portfolioRepository, transactionRepository, props) {
        super(assetRepository, portfolioRepository, transactionRepository, props);
        this.assetHolderRepository = new __3.AssetHolderRepository();
        this.mintService = new __2.MintService(assetRepository, portfolioRepository, transactionRepository);
    }
    static newMaker(assetRepository, portfolioRepository, transactionRepository, props) {
        const createdAt = luxon_1.DateTime.utc().toString();
        const type = props.type;
        const assetId = props.assetId;
        const makerProps = {
            createdAt,
            type,
            assetId,
            ownerId: props.ownerId,
            tags: props.tags,
        };
        const newEntity = new BondingCurveAMM(assetRepository, portfolioRepository, transactionRepository, makerProps);
        newEntity.params = newEntity.computeInitialState(props.settings);
        /////////////////////////////////////////////////////////
        // compute the quote(s)
        /////////////////////////////////////////////////////////
        const quote = {
            current: newEntity.spot_price(),
            bid1: newEntity.compute_price(),
            ask1: newEntity.compute_value(),
            bid10: newEntity.compute_price(10) / 10,
            ask10: newEntity.params.madeUnits >= 10 ? newEntity.compute_value(10) / 10 : NaN,
        };
        return newEntity;
    }
    computeInitialState(settings) {
        const makerState = {
            madeUnits: (settings === null || settings === void 0 ? void 0 : settings.initialUnits) || 0,
            cumulativeValue: (settings === null || settings === void 0 ? void 0 : settings.initialValue) || 0,
            y0: (settings === null || settings === void 0 ? void 0 : settings.initialPrice) || 1,
            e: (settings === null || settings === void 0 ? void 0 : settings.e) || 1,
            m: (settings === null || settings === void 0 ? void 0 : settings.m) || 1,
        };
        return makerState;
    }
    processOrderImpl(orderSide, orderSize) {
        return __awaiter(this, void 0, void 0, function* () {
            ////////////////////////////
            // verify that asset exists
            ////////////////////////////
            const asset = yield this.resolveAssetSpec(this.assetId);
            // this marketMaker pulls asset units from asset portfolio directly
            const assetPortfolioId = asset.portfolioId;
            if (!assetPortfolioId) {
                const msg = `Invalid Order: Asset Portfolio: not configured`;
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
            const taken = this.processAMMOrderImpl(signedTakerOrderSize);
            if (taken) {
                const data = taken.stateUpdate;
                data.quote = taken.quote;
                yield this.marketMakerRepository.updateMakerStateAsync(this.assetId, data);
                return taken;
            }
            else {
                return null;
            }
        });
    }
    ////////////////////////////////////////////////////////
    // PRIVATE
    ////////////////////////////////////////////////////////
    // positive order size - buy from marketMaker
    // negative order size - sel to marketMaker
    processAMMOrderImpl(signedTakerOrderSize) {
        const makerParams = this.params;
        if (!makerParams) {
            const msg = `Error: MarketMaker Parms not available: ${this.assetId}`;
            throw new __3.ConflictError(msg);
        }
        let makerDeltaUnits = 0;
        let makerDeltaValue = 0;
        if (signedTakerOrderSize >= 0) {
            // this is a buy so makerDeltaUnits should be negative - units leaving marketMaker
            // and makerDeltaValue should be positive - value added to marketMaker
            makerDeltaUnits = signedTakerOrderSize * -1;
            makerDeltaValue = this.compute_price(signedTakerOrderSize);
        }
        else {
            // this is a sell-back - so limited to number of units ever made
            const limitedTakeSize = Math.max(signedTakerOrderSize, this.params.madeUnits * -1);
            makerDeltaUnits = limitedTakeSize * -1;
            makerDeltaValue = this.compute_value(makerDeltaUnits) * -1;
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
        const quote = {
            last: {
                side: makerDeltaUnits < 0 ? 'bid' : 'ask',
                units: units,
                value: value,
                unitValue: value / units,
            },
            current: this.spot_price(),
            bid1: this.compute_price(),
            ask1: this.compute_value(),
            bid10: this.compute_price(10) / 10,
            ask10: this.params.madeUnits >= 10 ? this.compute_value(10) / 10 : NaN,
        };
        this.quote = quote;
        // NOTE: made units is inverse of "delta Units". It counts up for each buy
        // NOTE: Each marketMaker type has it's own way to "update" the persistent marketMaker state
        // so construct that here (the FieldValue does an atomic add to value.)
        const stateUpdate = {
            ['params.madeUnits']: FieldValue.increment(makerDeltaUnits * -1),
            ['params.cumulativeValue']: FieldValue.increment(makerDeltaValue),
        };
        const result = {
            makerDeltaUnits: makerDeltaUnits,
            makerDeltaValue: makerDeltaValue,
            stateUpdate: stateUpdate,
            quote: quote,
        };
        return result;
    }
    ////////////////////////////////////////////////////////
    // Bonding function
    ////////////////////////////////////////////////////////
    //////////////////////////////////////////
    // the current price point
    spot_price() {
        return this.__current_price_function(this.params.madeUnits);
    }
    //////////////////////////////////////////
    // the price to purchase units (default to 1)
    compute_price(units = 1) {
        return this.__delta_value_function(units);
    }
    //////////////////////////////////////////
    // the value to sell units (default to 1)
    compute_value(units = 1) {
        return -1.0 * this.__delta_value_function(-1.0 * units);
    }
    //////////////////////////////////////////
    // the current price point of transaction at 'epsilon'
    // (the bonding curven evaluated at x)
    __current_price_function(x) {
        x = Math.max(x, 0);
        const val = this.params.m * Math.pow(x, this.params.e) + this.params.y0;
        return val;
    }
    //////////////////////////////////////////
    // the total value of x units
    // (area under the bonding curve from 0 to x)
    __total_value_function(x) {
        x = Math.max(x, 0);
        const inc = this.params.e + 1.0;
        const val = (this.params.m * Math.pow(x, inc)) / inc + this.params.y0 * x;
        return val;
    }
    //////////////////////////////////////////
    // the value of x units if applie right now - x is signed
    // (the area under bonding curve from current x to  +/- some delta)
    __delta_value_function(delta_units) {
        const cost = this.__total_value_function(this.params.madeUnits + delta_units) -
            this.__total_value_function(this.params.madeUnits);
        return cost;
    }
}
exports.BondingCurveAMM = BondingCurveAMM;
