"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.round4 = void 0;
const round4 = (num) => {
    return Math.round((num + Number.EPSILON) * 10000) / 10000;
};
exports.round4 = round4;
