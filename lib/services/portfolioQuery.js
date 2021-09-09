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
class PortfolioQuery {
    constructor() {
        this.portfolioRepository = new __1.PortfolioRepository();
        this.portfolioActivityRepository = new __1.PortfolioActivityRepository();
        this.portfolioHoldingsRepository = new __1.PortfolioHoldingsRepository();
        this.portfolioOrdersRepository = new __1.PortfolioOrdersRepository();
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
    getPortfolioHoldingsAsync(portfolioId, qs) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                data: yield this.portfolioHoldingsRepository.getListAsync(portfolioId, qs),
            };
        });
    }
    getPortfolioHoldingDetailAsync(portfolioId, orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                data: yield this.portfolioHoldingsRepository.getDetailAsync(portfolioId, orderId),
            };
        });
    }
    getPortfolioActivityAsync(portfolioId, qs) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                data: yield this.portfolioActivityRepository.getListAsync(portfolioId, qs),
            };
        });
    }
    getPortfolioOrdersAsync(portfolioId, qs) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                data: yield this.portfolioOrdersRepository.getListAsync(portfolioId, qs),
            };
        });
    }
    getPortfolioOrderDetailAsync(portfolioId, orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                data: yield this.portfolioOrdersRepository.getDetailAsync(portfolioId, orderId),
            };
        });
    }
}
exports.PortfolioQuery = PortfolioQuery;
