'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.inverseBondingFunction = exports.bondingFunction = void 0;
const bondingFunction = (x, params) => {
    const limit = params.limit;
    const a = params.a;
    const k = params.k;
    return limit / (1 + a * Math.pow(Math.E, (-k * x)));
};
exports.bondingFunction = bondingFunction;
const inverseBondingFunction = (limit, currentPrice, madeUnits, coinPool) => {
    const magicConstant = 9.18482646743;
    const k = (limit * magicConstant) / coinPool;
    const a = (limit - currentPrice) / (currentPrice * Math.pow(Math.E, (-k * madeUnits)));
    const price0 = limit / (1 + a);
    const params = {
        price0: price0,
        limit: limit,
        a: a,
        k: k,
        coinPool: coinPool,
    };
    return params;
};
exports.inverseBondingFunction = inverseBondingFunction;
