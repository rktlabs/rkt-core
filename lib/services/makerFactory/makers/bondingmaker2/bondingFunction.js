'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.inverseBondingFunction = exports.bondingFunction = void 0;
const bondingFunction = (x, params) => {
    const x0 = params.x0;
    return x + x0 + 1;
};
exports.bondingFunction = bondingFunction;
const inverseBondingFunction = (currentPrice, madeUnits) => {
    const params = {
        //madeUnits: x,
        x0: currentPrice - 1 - madeUnits,
    };
    return params;
};
exports.inverseBondingFunction = inverseBondingFunction;
