"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Earner = void 0;
const luxon_1 = require("luxon");
const errors_1 = require("../../errors");
const earnerSerializer_1 = require("./earnerSerializer");
const earnerValidator_1 = require("./earnerValidator");
// Earner holds value (coin) and shares to be sold.
class Earner {
    constructor(props) {
        this.createdAt = props.createdAt;
        this.type = props.type;
        this.earnerId = props.earnerId;
        this.ownerId = props.ownerId;
        this.displayName = props.displayName;
        this.symbol = props.symbol;
        this.symbol = props.symbol;
        this.xids = props.xids;
        this.tags = props.tags;
        this.scale = props.scale;
        this.cumulativeEarnings = props.cumulativeEarnings;
    }
    // Member Properties for new model
    static newEarner(props) {
        const symbolParts = props.symbol.split(':');
        if (symbolParts.length < 2 || symbolParts[1] !== '') {
            throw new Error('New Earner: Invalid symbol');
        }
        const type = symbolParts[0];
        const earnerId = props.symbol;
        const createdAt = luxon_1.DateTime.utc().toString();
        const displayName = props.displayName || earnerId;
        const earnerProps = {
            earnerId,
            createdAt,
            displayName,
            symbol: props.symbol,
            ownerId: props.ownerId,
            type: type,
            scale: props.scale || 1,
            cumulativeEarnings: 0,
        };
        if (props.subject) {
            earnerProps.subject = props.subject;
        }
        if (props.tags) {
            earnerProps.tags = Object.assign({}, props.tags);
        }
        if (props.xids) {
            earnerProps.xids = Object.assign({}, props.xids);
        }
        const newEntity = new Earner(earnerProps);
        return newEntity;
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
            return earnerValidator_1.validate(jsonPayload);
        }
        catch (error) {
            // ValdationError
            throw new errors_1.ValidationError(error);
        }
    }
    static serialize(req, data) {
        return earnerSerializer_1.serialize(req, data);
    }
    static serializeCollection(req, data) {
        return earnerSerializer_1.serializeCollection(req, data);
    }
}
exports.Earner = Earner;
