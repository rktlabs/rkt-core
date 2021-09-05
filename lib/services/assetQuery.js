"use strict";
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
const assetRepository_1 = require("../repositories/assetRepository");
// import { AssetOutreachRepository } from '../repositories/assetOutreachRepository'
class AssetQuery {
    // outreachRepository: AssetOutreachRepository
    constructor() {
        this.assetRepository = new assetRepository_1.AssetRepository();
        // this.outreachRepository = new AssetOutreachRepository()
    }
    getListAsync(qs) {
        return __awaiter(this, void 0, void 0, function* () {
            //const rowcount: number = await this.assetRepository.countListAsync(clientId, qs)
            return {
                data: yield this.assetRepository.listAssets(qs),
                rowcount: 111,
            }; // TODO: no count
        });
    }
    getDetailAsync(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const assetDetail = yield this.assetRepository.getAsset(id);
            // if (assetDetail) {
            //   // const outreachList = await this.outreachRepository.getListForAssetAsync(clientId, id)
            //   // assetDetail.assetOutreaches = outreachList.map((assetOutreach: any) => {
            //   //   return {
            //   //     id: assetOutreach.id,
            //   //     assetId: assetOutreach.assetId,
            //   //     outreachId: assetOutreach.outreachId,
            //   //     outreachName: assetOutreach.outreachName,
            //   //     programId: assetOutreach.programId,
            //   //     programName: assetOutreach.programName,
            //   //     clientId: assetOutreach.clientId,
            //   //     clientName: assetOutreach.clientName,
            //   //     memberXid: assetOutreach.memberXid,
            //   //     channel: assetOutreach.channel,
            //   //     outreachStatus: assetOutreach.outreachStatus,
            //   //     firstAttemptAt: assetOutreach.firstAttemptAt,
            //   //     lastAttemptAt: assetOutreach.lastAttemptAt,
            //   //     attempts: assetOutreach.attempts,
            //   //     lastBestResult: assetOutreach.lastBestResult,
            //   //   }
            //   // })
            // }
            return assetDetail;
        });
    }
}
exports.AssetQuery = AssetQuery;
