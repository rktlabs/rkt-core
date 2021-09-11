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
exports.ParamUpdater = void 0;
const admin = require("firebase-admin");
const getConnectionProps_1 = require("../../../../repositories/getConnectionProps");
const FieldValue = admin.firestore.FieldValue;
const COLLECTION_NAME = 'makers';
class ParamUpdater {
    constructor() {
        this.db = (0, getConnectionProps_1.getConnectionProps)();
    }
    updateMakerParams(makerId, makerPropsUpdate) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityRef = this.db.collection(COLLECTION_NAME).doc(makerId);
            const data = {
                ['params.poolCoins']: FieldValue.increment(makerPropsUpdate.poolCoinDelta),
                ['params.poolUnits']: FieldValue.increment(makerPropsUpdate.poolUnitDelta),
                ['params.k']: FieldValue.increment(makerPropsUpdate.kDelta),
                ['madeUnits']: FieldValue.increment(makerPropsUpdate.madeUnitsDelta),
                ['currentPrice']: makerPropsUpdate.currentPrice,
            };
            yield entityRef.update(data);
        });
    }
}
exports.ParamUpdater = ParamUpdater;
