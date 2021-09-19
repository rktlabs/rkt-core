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
const luxon_1 = require("luxon");
const __1 = require("../../../..");
const entity_1 = require("../makerBase/entity");
const admin = require("firebase-admin");
const FieldValue = admin.firestore.FieldValue;
class KMaker extends entity_1.MakerBase {
    static newMaker(props) {
        var _a;
        const createdAt = luxon_1.DateTime.utc().toString();
        const type = props.type;
        const assetId = props.assetId;
        const makerProps = {
            createdAt,
            type,
            assetId,
            ownerId: props.ownerId,
            currentPrice: (_a = props.settings) === null || _a === void 0 ? void 0 : _a.initPrice,
        };
        const newEntity = new KMaker(makerProps);
        newEntity.params = newEntity.computeInitialState(props);
        return newEntity;
    }
    constructor(props) {
        super(props);
    }
    computeInitialState(newMakerConfig) {
        var _a, _b, _c;
        const initMadeUnits = ((_a = newMakerConfig.settings) === null || _a === void 0 ? void 0 : _a.initMadeUnits) || 0;
        const initPrice = ((_b = newMakerConfig.settings) === null || _b === void 0 ? void 0 : _b.initPrice) || 1;
        const initialPoolUnits = ((_c = newMakerConfig.settings) === null || _c === void 0 ? void 0 : _c.initialPoolUnits) || 1000;
        const poolUnits = initialPoolUnits - initMadeUnits;
        const poolCoins = poolUnits * initPrice;
        const k = poolUnits * poolCoins;
        const makerState = {
            madeUnits: initMadeUnits,
            poolUnits,
            poolCoins,
            k,
            x0: initialPoolUnits,
        };
        return makerState;
    }
    computeStateUpdate(stateUpdate) {
        const data = {
            ['params.poolCoins']: FieldValue.increment(stateUpdate.poolCoinDelta),
            ['params.poolUnits']: FieldValue.increment(stateUpdate.poolUnitDelta),
            ['params.k']: FieldValue.increment(stateUpdate.kDelta),
            ['madeUnits']: FieldValue.increment(stateUpdate.madeUnitsDelta),
            ['currentPrice']: stateUpdate.currentPrice,
        };
        return data;
    }
    processOrderImpl(orderSide, orderSize) {
        return __awaiter(this, void 0, void 0, function* () {
            ////////////////////////////////////////////////////////
            // Process the order
            ////////////////////////////////////////////////////////
            // for bid (a buy) I'm "removing" units from the pool, so flip sign
            const signedOrderSize = orderSide === 'ask' ? orderSize * -1 : orderSize;
            const taken = this.processOrderUnits(signedOrderSize);
            if (taken) {
                const data = taken.statusUpdate;
                yield this.makerRepository.updateMakerStateAsync(this.assetId, data);
                const { makerDeltaUnits, makerDeltaCoins } = taken;
                return { makerDeltaUnits, makerDeltaCoins };
            }
            else {
                return null;
            }
        });
    }
    ////////////////////////////////////////////////////////
    // PRIVATE
    ////////////////////////////////////////////////////////
    processOrderUnits(takeSize) {
        const makerParams = this.params;
        if (!makerParams) {
            return null;
        }
        const { propsUpdate } = this.computePrice(makerParams, takeSize);
        const statusUpdate = this.computeStateUpdate(propsUpdate);
        return {
            makerDeltaUnits: propsUpdate.poolUnitDelta,
            makerDeltaCoins: propsUpdate.poolCoinDelta,
            statusUpdate: statusUpdate,
        };
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
            // lastPrice: lastPrice,
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
exports.KMaker = KMaker;
