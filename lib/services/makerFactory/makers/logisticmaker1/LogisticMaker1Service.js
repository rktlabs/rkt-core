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
exports.LogisticMaker1Service = void 0;
const ParamUpdater_1 = require("./ParamUpdater");
const bondingFunction_1 = require("./bondingFunction");
const __1 = require("../../../..");
class LogisticMaker1Service {
    constructor() {
        this.makerRepository = new __1.MakerRepository();
        this.parmUpdater = new ParamUpdater_1.ParamUpdater();
        this.bondingFunction = bondingFunction_1.bondingFunction;
    }
    initializeParams(makerProps) {
        var _a, _b, _c, _d, _e;
        const initMadeUnits = ((_a = makerProps.settings) === null || _a === void 0 ? void 0 : _a.initMadeUnits) || 0;
        const initPrice = ((_b = makerProps.settings) === null || _b === void 0 ? void 0 : _b.initPrice) || 1;
        if (!((_c = makerProps.settings) === null || _c === void 0 ? void 0 : _c.limit)) {
            throw new Error('No limit specified for maker');
        }
        const limit = ((_d = makerProps.settings) === null || _d === void 0 ? void 0 : _d.limit) || 1000;
        const coinPool = ((_e = makerProps.settings) === null || _e === void 0 ? void 0 : _e.coinPool) || 100 * 1000;
        const params = (0, bondingFunction_1.inverseBondingFunction)(limit, initPrice, initMadeUnits, coinPool);
        return Object.assign(Object.assign({}, makerProps), { params });
    }
    takeUnits(makerId, takeSize) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO TODO Do this in transaction
            const maker = yield this.makerRepository.getDetailAsync(makerId);
            if (!maker) {
                return null;
            }
            const makerParams = maker.params;
            if (!makerParams) {
                return null;
            }
            const madeUnits = maker.madeUnits;
            let makerDeltaUnits = 0;
            let makerDeltaCoins = 0;
            let coins = 0;
            if (takeSize > 0) {
                // for bid (a buy) so maker units is negative, maker coins is positive
                for (let x = madeUnits; x < madeUnits + takeSize; ++x) {
                    coins += this.bondingFunction(x, makerParams);
                }
                makerDeltaUnits = takeSize * -1;
                makerDeltaCoins = (0, __1.round4)(coins);
            }
            else {
                const limitedTakeSize = Math.max(takeSize, madeUnits * -1); // is negative
                // ask (sell) maker units is positive, maker coins is negative
                for (let x = madeUnits - 1; x >= madeUnits + limitedTakeSize; --x) {
                    coins += this.bondingFunction(x, makerParams);
                }
                makerDeltaUnits = limitedTakeSize * -1; // will be positive
                makerDeltaCoins = (0, __1.round4)(coins) * -1;
            }
            // last price adjusted based on taker quantity
            const bid = this.bondingFunction(maker.madeUnits - makerDeltaUnits - 1, makerParams);
            const ask = this.bondingFunction(maker.madeUnits - makerDeltaUnits - 0, makerParams);
            const last = bid;
            const propsUpdate = {
                madeUnitsDelta: makerDeltaUnits * -1,
                currentPrice: ask,
            };
            yield this.parmUpdater.updateMakerParams(makerId, propsUpdate);
            return {
                bid: bid,
                ask: ask,
                last: last,
                makerDeltaUnits: makerDeltaUnits,
                makerDeltaCoins: makerDeltaCoins,
            };
        });
    }
}
exports.LogisticMaker1Service = LogisticMaker1Service;
