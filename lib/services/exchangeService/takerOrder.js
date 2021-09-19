'use strict';
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _TakerOrder_sizeRemaining;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TakerOrder = void 0;
class TakerOrder {
    constructor(opts) {
        _TakerOrder_sizeRemaining.set(this, void 0);
        // eslint-disable-line
        this.assetId = opts.assetId;
        this.orderId = opts.orderId;
        this.portfolioId = opts.portfolioId;
        this.orderSide = opts.orderSide;
        this.orderSize = Math.max(opts.orderSize, 0);
        this.tags = opts.tags;
        this.orderType = opts.orderType ? opts.orderType : 'market';
        __classPrivateFieldSet(this, _TakerOrder_sizeRemaining, opts.sizeRemaining === undefined ? opts.orderSize : opts.sizeRemaining, "f");
        this.orderStatus = 'new';
        this.orderState = 'open';
    }
    get sizeRemaining() {
        return __classPrivateFieldGet(this, _TakerOrder_sizeRemaining, "f");
    }
    reduceSizeRemaining(sizeReduction) {
        const actualReduction = Math.min(sizeReduction, __classPrivateFieldGet(this, _TakerOrder_sizeRemaining, "f"));
        __classPrivateFieldSet(this, _TakerOrder_sizeRemaining, __classPrivateFieldGet(this, _TakerOrder_sizeRemaining, "f") - actualReduction, "f");
        return actualReduction;
    }
}
exports.TakerOrder = TakerOrder;
_TakerOrder_sizeRemaining = new WeakMap();
