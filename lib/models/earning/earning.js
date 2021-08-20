"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Earning = void 0;
const earningSerializer_1 = require("./earningSerializer");
const errors_1 = require("../../errors");
const earningValidator_1 = require("./earningValidator");
const cryptojs = require("crypto-js");
class Earning {
    static serializeCollection(req, earnerId, data) {
        return earningSerializer_1.serializeCollection(req, earnerId, data);
    }
    static sig(earning) {
        const eventString = JSON.stringify(earning.event);
        const payload = `${earning.earnedAt}|${earning.units}|${eventString}`
            .toLowerCase() // force lower case
            .replace(/\s/g, ''); // strip out all whitespace
        const sig = cryptojs.SHA256(payload).toString();
        return sig;
    }
    static validate(jsonPayload) {
        if (jsonPayload.earnerId && jsonPayload.type) {
            const parts = jsonPayload.earnerId.split(':');
            if (parts[0] !== jsonPayload.type) {
                throw new errors_1.TypeError('Invalid Earner Id (type)');
            }
            else if (parts.length < 3 || parts[1] !== '') {
                throw new errors_1.NameError('Invalid Earner Id');
            }
        }
        try {
            earningValidator_1.validate(jsonPayload);
            return jsonPayload;
        }
        catch (error) {
            // ValdationError
            throw new errors_1.ValidationError(error);
        }
    }
}
exports.Earning = Earning;
