"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Asset = void 0;
const luxon_1 = require("luxon");
const errors_1 = require("../../errors");
const assetSerializer_1 = require("./assetSerializer");
const assetValidator_1 = require("./assetValidator");
// Asset holds value (coin) and shares to be sold.
class Asset {
    constructor(props) {
        this.createdAt = props.createdAt;
        this.type = props.type;
        this.symbol = props.symbol;
        this.assetId = props.assetId;
        this.ownerId = props.ownerId;
        this.portfolioId = props.portfolioId;
        this.displayName = props.displayName;
        this.contractId = props.contractId;
        this.contractDisplayName = props.contractDisplayName;
        this.earnerId = props.earnerId;
        this.earnerDisplayName = props.earnerDisplayName;
        this.xids = props.xids;
        this.tags = props.tags;
        this.cumulativeEarnings = props.cumulativeEarnings;
        this.initialPrice = props.initialPrice;
        this.bid = props.bid;
        this.ask = props.ask;
        this.last = props.last;
    }
    toString() {
        return `[asset: ${this.assetId}]`;
    }
    // Member Properties for new model
    static newAsset(props) {
        const symbolParts = props.symbol.split(':');
        if (symbolParts.length < 2 || symbolParts[1] !== '') {
            throw new Error('New Asset: Invalid symbol');
        }
        const type = symbolParts[0];
        const assetId = props.symbol;
        const createdAt = luxon_1.DateTime.utc().toString();
        const displayName = props.displayName || assetId;
        const assetProps = {
            assetId,
            createdAt,
            displayName,
            ownerId: props.ownerId,
            type: type,
            symbol: props.symbol,
            contractId: props.contractId,
            contractDisplayName: props.contractDisplayName || props.contractId,
            earnerId: props.earnerId,
            earnerDisplayName: props.earnerDisplayName || props.earnerId,
            cumulativeEarnings: 0,
        };
        if (props.tags) {
            assetProps.tags = Object.assign({}, props.tags);
        }
        if (props.xids) {
            assetProps.xids = Object.assign({}, props.xids);
        }
        if (props.initialPrice) {
            assetProps.initialPrice = props.initialPrice;
            assetProps.bid = props.initialPrice;
            assetProps.ask = props.initialPrice;
            assetProps.last = props.initialPrice;
        }
        const newEntity = new Asset(assetProps);
        return newEntity;
    }
    static validate(jsonPayload) {
        if (jsonPayload.assetId && jsonPayload.type) {
            const parts = jsonPayload.assetId.split(':');
            if (parts[0] !== jsonPayload.type) {
                throw new errors_1.TypeError('Invalid Asset Id (type)');
            }
            else if (parts.length < 3 || parts[1] !== '') {
                throw new errors_1.NameError('Invalid Asset Id');
            }
        }
        try {
            return assetValidator_1.validate(jsonPayload);
        }
        catch (error) {
            // ValdationError
            throw new errors_1.ValidationError(error);
        }
    }
    static serialize(req, data) {
        return assetSerializer_1.serialize(req, data);
    }
    static serializeCollection(req, data) {
        return assetSerializer_1.serializeCollection(req, data);
    }
}
exports.Asset = Asset;