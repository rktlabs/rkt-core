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
exports.MakerQuery = void 0;
const marketMakerRepository_1 = require("../repositories/marketMaker/marketMakerRepository");
class MakerQuery {
    constructor() {
        this.marketMakerRepository = new marketMakerRepository_1.MarketMakerRepository();
    }
    getListAsync(qs) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                data: yield this.marketMakerRepository.getListAsync(qs),
            };
        });
    }
    getDetailAsync(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const makerDetail = yield this.marketMakerRepository.getDetailAsync(id);
            return makerDetail;
        });
    }
}
exports.MakerQuery = MakerQuery;
