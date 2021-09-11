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
exports.KMakerService = void 0;
const ParamUpdater_1 = require("./ParamUpdater");
const __1 = require("../../../..");
class KMakerService {
    constructor() {
        this.makerRepository = new __1.MakerRepository();
        this.parmUpdater = new ParamUpdater_1.ParamUpdater();
    }
    initializeParams(makerProps) {
        var _a, _b, _c;
        const initMadeUnits = ((_a = makerProps.settings) === null || _a === void 0 ? void 0 : _a.initMadeUnits) || 0;
        const initPrice = ((_b = makerProps.settings) === null || _b === void 0 ? void 0 : _b.initPrice) || 1;
        const initialPoolUnits = ((_c = makerProps.settings) === null || _c === void 0 ? void 0 : _c.initialPoolUnits) || 1000;
        const poolUnits = initialPoolUnits - initMadeUnits;
        const poolCoins = poolUnits * initPrice;
        const k = poolUnits * poolCoins;
        const params = {
            poolUnits,
            poolCoins,
            k,
            x0: initialPoolUnits,
        };
        return Object.assign(Object.assign({}, makerProps), { params });
    }
    takeUnits(makerId, takeSize) {
        return __awaiter(this, void 0, void 0, function* () {
            const maker = yield this.makerRepository.getDetailAsync(makerId);
            if (!maker) {
                return null;
            }
            const makerParams = maker.params;
            if (!makerParams) {
                return null;
            }
            const { lastPrice: ask, propsUpdate } = this.computePrice(makerParams, takeSize);
            const { lastPrice: bid } = this.computePrice(makerParams, takeSize - 1);
            yield this.parmUpdater.updateMakerParams(makerId, propsUpdate);
            return {
                bid: bid,
                ask: ask,
                last: bid,
                makerDeltaUnits: propsUpdate.poolUnitDelta,
                makerDeltaCoins: propsUpdate.poolCoinDelta,
            };
        });
    }
    computePrice(maker, orderSize) {
        const initialPoolUnits = maker.poolUnits;
        const initialPoolCoins = maker.poolCoins;
        const k = maker.k;
        let makerPoolUnitDelta = orderSize;
        if (makerPoolUnitDelta < 0) {
            const makerSizeRemaining = (initialPoolUnits - 1) * -1; // NOTE: Can't take last unit
            makerPoolUnitDelta = Math.max(orderSize, makerSizeRemaining);
        }
        const newMakerPoolUnits = (0, __1.round4)(initialPoolUnits - makerPoolUnitDelta);
        const newMakerPoolCoins = (0, __1.round4)(k / newMakerPoolUnits); // maintain constant
        const makerPoolCoinDelta = (0, __1.round4)(newMakerPoolCoins - initialPoolCoins);
        const lastPrice = (0, __1.round4)(newMakerPoolCoins / newMakerPoolUnits);
        return {
            lastPrice: lastPrice,
            propsUpdate: {
                poolUnitDelta: makerPoolUnitDelta * -1,
                poolCoinDelta: makerPoolCoinDelta,
                kDelta: 0,
                madeUnitsDelta: makerPoolUnitDelta,
                currentPrice: lastPrice,
            },
        };
    }
}
exports.KMakerService = KMakerService;
