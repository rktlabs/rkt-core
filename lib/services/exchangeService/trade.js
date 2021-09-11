'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.Trade = void 0;
const luxon_1 = require("luxon");
const takerFill_1 = require("./takerFill");
const __1 = require("../..");
class Trade {
    constructor(takerOrder) {
        this.assetId = takerOrder.assetId;
        // construct TakerFill from Order
        const takerTradeFill = new takerFill_1.TakerFill({
            assetId: takerOrder.assetId,
            orderId: takerOrder.orderId,
            portfolioId: takerOrder.portfolioId,
            orderType: takerOrder.orderType,
            orderSide: takerOrder.orderSide,
            orderSize: takerOrder.orderSize,
            sizeRemaining: takerOrder.sizeRemaining,
            tags: takerOrder.tags,
        });
        this.taker = takerTradeFill;
        this.makers = [];
        this.tradeId = `TRADE::${(0, __1.generateId)()}`;
        this.executedAt = luxon_1.DateTime.utc().toString();
    }
    fillMaker(makerFill, makerUnitDelta, makerCoinDelta) {
        this.taker.fill(-1 * makerUnitDelta, -1 * makerCoinDelta); // taker gets flip side of maker
        makerFill.fill(makerUnitDelta, makerCoinDelta);
        this.makers.push(makerFill);
    }
}
exports.Trade = Trade;
