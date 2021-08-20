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
exports.EarnerService = void 0;
const luxon_1 = require("luxon");
const repositories_1 = require("../repositories");
const models_1 = require("../models");
const errors_1 = require("../errors");
class EarnerService {
    constructor(db, eventPublisher) {
        this.earnerRepository = new repositories_1.EarnerRepository(db);
        this.earningsRepository = new repositories_1.EarningsRepository(db);
        this.assetRepository = new repositories_1.AssetRepository(db);
    }
    newEarner(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const earnerId = payload.symbol;
            if (earnerId) {
                const earner = yield this.earnerRepository.getEarner(earnerId);
                if (earner) {
                    const msg = `Earner Creation Failed - earnerId: ${earnerId} already exists`;
                    throw new errors_1.DuplicateError(msg, { earnerId });
                }
            }
            const earner = yield this.createEarnerImpl(payload);
            return earner;
        });
    }
    deleteEarner(earnerId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.earnerRepository.deleteEarner(earnerId);
        });
    }
    scrubEarner(earnerId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.earnerRepository.deleteEarner(earnerId);
        });
    }
    submitEarnings(earnerId, earning) {
        return __awaiter(this, void 0, void 0, function* () {
            const timeAtNow = luxon_1.DateTime.utc().toString();
            earning.earnedAt = timeAtNow;
            const units = earning.units;
            yield this.earningsRepository.storeEarnerEarning(earnerId, earning);
            yield this.earnerRepository.adjustCumulativeEarnings(earnerId, units);
            const earnerAssets = yield this.assetRepository.listEarnerAssets(earnerId);
            const promises = [];
            earnerAssets.forEach((assetId) => {
                promises.push(this.earningsRepository.storeAssetEarning(assetId, earning));
                promises.push(this.assetRepository.adjustCumulativeEarnings(assetId, units));
            });
            return Promise.all(promises);
        });
    }
    ///////////////////////////////////////////
    // Private Methods
    ///////////////////////////////////////////
    createEarnerImpl(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const earner = models_1.Earner.newEarner(payload);
            yield this.earnerRepository.storeEarner(earner);
            return earner;
        });
    }
}
exports.EarnerService = EarnerService;
