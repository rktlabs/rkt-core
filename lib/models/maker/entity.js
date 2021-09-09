"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Maker = void 0;
const luxon_1 = require("luxon");
const errors_1 = require("../../errors");
const serializer_1 = require("./serializer");
const validator_1 = require("./validator");
// Maker holds value (coin) and shares to be sold.
class Maker {
    constructor(props) {
        this.createdAt = props.createdAt;
        this.type = props.type;
        this.symbol = props.symbol;
        this.makerId = props.makerId;
        this.displayName = props.displayName;
        this.ownerId = props.ownerId;
        // this.portfolioId = props.portfolioId
        this.leagueId = props.leagueId;
        this.leagueDisplayName = props.leagueDisplayName;
        this.xids = props.xids;
        this.tags = props.tags;
        // this.initialPrice = props.initialPrice
        this.bid = props.bid;
        this.ask = props.ask;
        this.last = props.last;
    }
    toString() {
        return `[maker: ${this.makerId}]`;
    }
    static newMaker(props) {
        const symbolParts = props.symbol.split(':');
        if (symbolParts.length < 2 || symbolParts[1] !== '') {
            throw new Error('New Maker: Invalid symbol');
        }
        const type = symbolParts[0];
        const makerId = props.symbol;
        const createdAt = luxon_1.DateTime.utc().toString();
        const displayName = props.displayName || makerId;
        const makerProps = {
            makerId,
            createdAt,
            displayName,
            ownerId: props.ownerId,
            type: type,
            symbol: props.symbol,
            leagueId: props.leagueId,
            leagueDisplayName: props.leagueDisplayName || props.leagueId,
        };
        if (props.tags) {
            makerProps.tags = Object.assign({}, props.tags);
        }
        if (props.xids) {
            makerProps.xids = Object.assign({}, props.xids);
        }
        // if (props.initialPrice) {
        //     makerProps.initialPrice = props.initialPrice
        //     makerProps.bid = props.initialPrice
        //     makerProps.ask = props.initialPrice
        //     makerProps.last = props.initialPrice
        // }
        const newEntity = new Maker(makerProps);
        return newEntity;
    }
    static validate(jsonPayload) {
        if (jsonPayload.makerId && jsonPayload.type) {
            const parts = jsonPayload.makerId.split(':');
            if (parts[0] !== jsonPayload.type) {
                throw new errors_1.TypeError('Invalid Maker Id (type)');
            }
            else if (parts.length < 3 || parts[1] !== '') {
                throw new errors_1.NameError('Invalid Maker Id');
            }
        }
        try {
            return (0, validator_1.validate)(jsonPayload);
        }
        catch (error) {
            throw new errors_1.ValidationError(error);
        }
    }
    static serialize(selfUrl, baseUrl, data) {
        return (0, serializer_1.serialize)(selfUrl, baseUrl, data);
    }
    static serializeCollection(selfUrl, baseUrl, qs, data) {
        return (0, serializer_1.serializeCollection)(selfUrl, baseUrl, qs, data);
    }
}
exports.Maker = Maker;
