"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateNonce = exports.generateId = exports.LENGTH = exports.ALPHABET = void 0;
const nanoid_1 = require("nanoid");
exports.ALPHABET = 'ABCDEFGHJKLMNPRSTUVWXYZ23456789'; // remove 0, 1, O, Q, I
exports.LENGTH = 8;
exports.generateId = nanoid_1.customAlphabet(exports.ALPHABET, exports.LENGTH);
exports.generateNonce = nanoid_1.nanoid;
