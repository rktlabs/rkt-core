'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExchangeTrade = void 0;
const luxon_1 = require("luxon");
const serializer_1 = require("./serializer");
const util_1 = require("../../util");
class ExchangeTrade {
    constructor(order) {
        this.tradeId = `TRADE::${(0, util_1.generateId)()}`;
        this.executedAt = luxon_1.DateTime.utc().toString();
        this.createdAt = luxon_1.DateTime.utc().toString();
        this.assetId = order.assetId;
        this.makers = [];
        // construct Taker from Order
        const taker = this._generateTaker({
            assetId: order.assetId,
            orderId: order.orderId,
            portfolioId: order.portfolioId,
            orderType: order.orderType,
            orderSide: order.orderSide,
            orderSize: order.orderSize,
            tags: order.tags,
            sizeRemaining: order.sizeRemaining,
        });
        this.taker = taker;
    }
    supplyMakerSide(opts) {
        const maker = {
            orderId: opts.orderId,
            assetId: opts.assetId,
            orderSide: opts.orderSide,
            orderSize: Math.max(opts.orderSize, 0),
            portfolioId: opts.portfolioId,
            sizeRemaining: !opts.sizeRemaining ? opts.orderSize : opts.sizeRemaining,
            filledSize: 0,
            filledValue: 0,
            filledPrice: 0,
            isPartial: false,
            isClosed: false,
        };
        this._fillMaker(maker, opts.makerDeltaUnits, opts.makerDeltaValue);
        return maker;
    }
    static serialize(selfUrl, baseUrl, data) {
        return (0, serializer_1.serialize)(selfUrl, baseUrl, data);
    }
    static serializeCollection(selfUrl, baseUrl, qs, data) {
        return (0, serializer_1.serializeCollection)(selfUrl, baseUrl, qs, data);
    }
    //////////////////////////////////////////////
    // PRIVATE
    //////////////////////////////////////////////
    _fillMaker(maker, makerUnitDelta, makerCoinDelta) {
        this._updateTakerFill(this.taker, -1 * makerUnitDelta, -1 * makerCoinDelta); // taker gets flip side of maker
        this._updateMakerFill(maker, makerUnitDelta, makerCoinDelta);
        this.makers.push(maker);
    }
    _updateTakerFill(taker, size, value) {
        // filledSize should reflect signed size ( - for reduction)
        taker.filledSize += size;
        // value will be opposite direction of size (negative)
        taker.filledValue += value;
        taker.filledPrice = taker.filledSize === 0 ? 0 : Math.abs((0, util_1.round4)(taker.filledValue / taker.filledSize));
        // reduce order size by absolute value
        const actualReduction = Math.min(Math.abs(size), taker.sizeRemaining);
        taker.sizeRemaining -= actualReduction;
        taker.isClosed = taker.sizeRemaining === 0;
        taker.isPartial = Math.abs(taker.filledSize) < taker.orderSize;
    }
    _updateMakerFill(maker, size, value) {
        // filledSize should reflect signed size ( - for reduction)
        maker.filledSize += size;
        // value will be opposite direction of size (negative)
        maker.filledValue += value;
        maker.filledPrice = maker.filledSize === 0 ? 0 : Math.abs((0, util_1.round4)(maker.filledValue / maker.filledSize));
        // reduce order size by absolute value
        const actualReduction = Math.min(Math.abs(size), maker.sizeRemaining);
        maker.sizeRemaining -= actualReduction;
        maker.isClosed = maker.sizeRemaining === 0;
        maker.isPartial = Math.abs(maker.filledSize) < maker.orderSize;
    }
    _generateTaker(opts) {
        const taker = {
            assetId: opts.assetId,
            orderSide: opts.orderSide,
            orderSize: Math.max(opts.orderSize, 0),
            tags: opts.tags,
            orderType: opts.orderType,
            orderId: opts.orderId,
            portfolioId: opts.portfolioId,
            sizeRemaining: !opts.sizeRemaining ? opts.orderSize : opts.sizeRemaining,
            filledSize: 0,
            filledValue: 0,
            filledPrice: 0,
            isPartial: false,
            isClosed: false,
            isLiquidityStarved: false,
        };
        return taker;
    }
}
exports.ExchangeTrade = ExchangeTrade;
