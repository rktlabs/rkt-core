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
exports.PortfolioQuery = void 0;
const __1 = require("..");
class PortfolioQuery {
    constructor(portfolioRepository, portfolioOrderRepository) {
        this.portfolioRepository = portfolioRepository;
        this.activityRepository = new __1.ActivityRepository();
        this.portfolioHoldingRepository = new __1.PortfolioHoldingRepository();
        this.portfolioOrderRepository = portfolioOrderRepository;
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
                data: yield this.portfolioHoldingRepository.getListAsync(portfolioId, qs),
            };
        });
    }
    getPortfolioHoldingDetailAsync(portfolioId, assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                data: yield this.portfolioHoldingRepository.getDetailAsync(portfolioId, assetId),
            };
        });
    }
    getPortfolioActivityAsync(portfolioId, qs) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                data: yield this.activityRepository.getPortfolioListAsync(portfolioId, qs),
            };
        });
    }
    getPortfolioOrdersAsync(portfolioId, qs) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                data: yield this.portfolioOrderRepository.getListAsync(portfolioId, qs),
            };
        });
    }
    getPortfolioOrderDetailAsync(portfolioId, orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                data: yield this.portfolioOrderRepository.getDetailAsync(portfolioId, orderId),
            };
        });
    }
}
exports.PortfolioQuery = PortfolioQuery;
