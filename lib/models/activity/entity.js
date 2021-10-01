'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.Activity = void 0;
const serialize_1 = require("./serialize");
class Activity {
    static serializeCollection(selfUrl, baseUrl, qs, data) {
        return (0, serialize_1.serializeCollection)(selfUrl, baseUrl, qs, data);
    }
}
exports.Activity = Activity;
