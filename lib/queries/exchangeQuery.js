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
exports.ExchangeQuery = void 0;
const __1 = require("..");
class ExchangeQuery {
    constructor() {
        this.exchangeQuoteRepository = new __1.ExchangeQuoteRepository();
        this.exchangeTradeRepository = new __1.ExchangeTradeRepository();
        this.exchangeOrderRepository = new __1.ExchangeOrderRepository();
    }
    getExchangeTradesAsync(qs) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                data: yield this.exchangeTradeRepository.getListAsync(qs),
            };
        });
    }
    getExchangeTradeDetailAsync(tradeId) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                data: yield this.exchangeTradeRepository.getDetailAsync(tradeId),
            };
        });
    }
    getExchangeQuotesAsync(qs) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                data: yield this.exchangeQuoteRepository.getListAsync(qs),
            };
        });
    }
    getExchangeQuoteAsync(assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                data: yield this.exchangeQuoteRepository.getDetailAsync(assetId),
            };
        });
    }
    getExchangeOrdersAsync(qs) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                data: yield this.exchangeOrderRepository.getListAsync(qs),
            };
        });
    }
    getExchangeOrderDetailAsync(orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                data: yield this.exchangeOrderRepository.getDetailAsync(orderId),
            };
        });
    }
}
exports.ExchangeQuery = ExchangeQuery;
