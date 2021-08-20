'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.Trade = void 0;
const luxon_1 = require("luxon");
const idGenerator_1 = require("../../util/idGenerator");
const errors_1 = require("../../errors");
const tradeSerializer_1 = require("./tradeSerializer");
const tradeValidator_1 = require("./tradeValidator");
class Trade {
    constructor(props) {
        if (props)
            Object.assign(this, props);
        this.createdAt = luxon_1.DateTime.utc().toString();
        // generate id. Trades start with TRADE: as a cue that it's a Trade
        if (!props.tradeId) {
            this.tradeId = `TRADE::${idGenerator_1.generateId()}`;
        }
    }
    // Member Properties for new model
    static newTrade(props) {
        // TODO: pick out relevant props (like done in asset) before creating
        const newTradeProps = Object.assign({}, props);
        const newEntity = new Trade(newTradeProps);
        return newEntity;
    }
    static serialize(req, data) {
        return tradeSerializer_1.serialize(req, data);
    }
    static serializeCollection(req, data) {
        return tradeSerializer_1.serializeCollection(req, data);
    }
    static validate(jsonPayload) {
        try {
            return tradeValidator_1.validate(jsonPayload);
        }
        catch (error) {
            // ValdationError
            throw new errors_1.ValidationError(error);
        }
    }
}
exports.Trade = Trade;
