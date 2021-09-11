"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Maker = void 0;
const serializer_1 = require("./serializer");
const luxon_1 = require("luxon");
// Maker holds value (coin) and shares to be sold.
class Maker {
    constructor(props) {
        this.createdAt = props.createdAt;
        this.type = props.type;
        this.assetId = props.assetId;
        this.ownerId = props.ownerId;
        this.portfolioId = props.portfolioId;
        this.madeUnits = props.madeUnits;
        this.currentPrice = props.currentPrice;
        this.params = props.params;
    }
    // Member Properties for new model
    static newMaker(props) {
        var _a;
        const createdAt = luxon_1.DateTime.utc().toString();
        const type = props.type;
        const assetId = props.assetId;
        const makerProps = {
            createdAt,
            type,
            assetId,
            ownerId: props.ownerId,
            madeUnits: 0,
            currentPrice: (_a = props.settings) === null || _a === void 0 ? void 0 : _a.initPrice,
            params: props.params,
        };
        const newEntity = new Maker(makerProps);
        return newEntity;
    }
    static serialize(selfUrl, baseUrl, data) {
        return (0, serializer_1.serialize)(selfUrl, baseUrl, data);
    }
    static serializeCollection(selfUrl, baseUrl, qs, data) {
        return (0, serializer_1.serializeCollection)(selfUrl, baseUrl, qs, data);
    }
}
exports.Maker = Maker;
