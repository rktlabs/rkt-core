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
exports.AssetQuery = void 0;
const __1 = require("..");
const assetHolderRepository_1 = require("../repositories/asset/assetHolderRepository");
class AssetQuery {
    constructor(assetRepository) {
        this.assetRepository = assetRepository;
        this.activityRepository = new __1.ActivityRepository();
        this.assetHolderRepository = new assetHolderRepository_1.AssetHolderRepository();
    }
    getListAsync(qs) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                data: yield this.assetRepository.getListAsync(qs),
            };
        });
    }
    getDetailAsync(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const assetDetail = yield this.assetRepository.getDetailAsync(id);
            return assetDetail;
        });
    }
    getAssetHoldersAsync(assetId, qs) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                data: yield this.assetHolderRepository.getListAsync(assetId, qs),
            };
        });
    }
    getAssetActivityAsync(assetId, qs) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                data: yield this.activityRepository.getAssetListAsync(assetId, qs),
            };
        });
    }
}
exports.AssetQuery = AssetQuery;
