'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.inverseBondingFunction = exports.bondingFunction = void 0;
const bondingFunction = (x, params) => {
    // return x + 1
    // return 1.05 ** x
    const x0 = params.x0;
    return x + x0 === 0 ? 1 : 1 + Math.pow((x + x0), (1 / 2));
};
exports.bondingFunction = bondingFunction;
const inverseBondingFunction = (currentPrice, madeUnits) => {
    // return y - 1
    // return y ** (1/1.05)
    const params = {
        x0: Math.pow((currentPrice - 1), 2) - madeUnits,
    };
    return params;
};
exports.inverseBondingFunction = inverseBondingFunction;
