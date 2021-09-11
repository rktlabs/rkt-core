'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.TakerFill = void 0;
const __1 = require("../..");
class TakerFill {
    constructor(opts) {
        this.assetId = opts.assetId;
        this.orderSide = opts.orderSide;
        this.orderSize = Math.max(opts.orderSize, 0);
        this.tags = opts.tags;
        this.sizeRemaining = opts.sizeRemaining === undefined ? opts.orderSize : opts.sizeRemaining;
        if (opts.orderType) {
            this.orderType = opts.orderType;
        }
        this.orderId = opts.orderId;
        this.portfolioId = opts.portfolioId;
        this.sizeRemaining = !opts.sizeRemaining ? opts.orderSize : opts.sizeRemaining;
        this.tags = opts.tags;
        this.filledSize = 0;
        this.filledValue = 0;
        this.filledPrice = 0;
        this.isPartial = false;
        this.isClosed = false;
        this.isLiquidityStarved = false;
    }
    reduceSizeRemaining(sizeReduction) {
        const actualReduction = Math.min(sizeReduction, this.sizeRemaining);
        this.sizeRemaining -= actualReduction;
        return actualReduction;
    }
    fill(size, value) {
        // filledSize should reflect signed size ( - for reduction)
        this.filledSize += size;
        // value will be opposite direction of size (negative)
        this.filledValue += value;
        this.filledPrice = this.filledSize === 0 ? 0 : Math.abs((0, __1.round4)(this.filledValue / this.filledSize));
        // reduce order size by absolute value
        this.reduceSizeRemaining(Math.abs(size));
        this.isClosed = this.sizeRemaining === 0;
        this.isPartial = Math.abs(this.filledSize) < this.orderSize;
    }
}
exports.TakerFill = TakerFill;
