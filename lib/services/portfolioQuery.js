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
exports.PortfolioQuery = void 0;
const __1 = require("..");
const portfolioRepository_1 = require("../repositories/portfolioRepository");
class PortfolioQuery {
    constructor() {
        this.portfolioRepository = new portfolioRepository_1.PortfolioRepository();
        this.portfolioActivityRepository = new __1.PortfolioActivityRepository();
        this.portfolioHoldingsRepository = new __1.PortfolioHoldingsRepository();
    }
    getListAsync(qs) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                data: yield this.portfolioRepository.getListAsync(qs),
            };
        });
    }
    getDetailAsync(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const portfolioDetail = yield this.portfolioRepository.getDetailAsync(id);
            return portfolioDetail;
        });
    }
    getPortfolioHoldingsAsync(qs) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                data: yield this.portfolioHoldingsRepository.listPortfolioHoldings(qs),
            };
        });
    }
    getPortfolioActivityAsync(qs) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                data: yield this.portfolioActivityRepository.listPortfolioActivity(qs),
            };
        });
    }
}
exports.PortfolioQuery = PortfolioQuery;
