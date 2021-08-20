"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Contract = void 0;
const errors_1 = require("../../errors");
const luxon_1 = require("luxon");
const idGenerator_1 = require("../../util/idGenerator");
const contractSerializer_1 = require("./contractSerializer");
const contractValidator_1 = require("./contractValidator");
// Contract holds value (coin) and shares to be sold.
class Contract {
    constructor(props) {
        this.createdAt = props.createdAt;
        this.contractId = props.contractId;
        this.ownerId = props.ownerId;
        this.portfolioId = props.portfolioId;
        this.displayName = props.displayName || props.contractId;
        this.description = props.description || this.displayName;
        this.startAt = props.startAt;
        this.endAt = props.endAt;
        this.acceptEarningsAfter = props.acceptEarningsAfter;
        this.ignoreEarningsAfter = props.ignoreEarningsAfter;
        this.key = props.key;
        this.pt = props.pt;
        this.tags = props.tags;
        // this.playerList = props.playerList
        this.managedAssets = props.managedAssets;
        this.currencyId = props.currencyId;
        this.currencySource = props.currencySource;
    }
    // Member Properties for new model
    static newContract(props) {
        const contractId = props.contractId || `${idGenerator_1.generateId()}`;
        const createdAt = luxon_1.DateTime.utc().toString();
        const displayName = props.displayName || contractId;
        const description = props.displayName || displayName;
        const portfolioId = `contract::${contractId}`;
        const contractProps = {
            contractId,
            createdAt,
            displayName,
            description,
            ownerId: props.ownerId,
            portfolioId: portfolioId,
            startAt: props.startAt || createdAt,
            endAt: props.endAt,
            acceptEarningsAfter: props.acceptEarningsAfter || props.startAt || createdAt,
            ignoreEarningsAfter: props.ignoreEarningsAfter || props.endAt,
            key: props.key,
            pt: props.pt,
            //playerList: props.earnerList,
            managedAssets: [],
            currencyId: 'coin::fantx',
            currencySource: 'contract::mint',
        };
        if (props.tags) {
            contractProps.tags = Object.assign({}, props.tags);
        }
        const newEntity = new Contract(contractProps);
        return newEntity;
    }
    static validate(jsonPayload) {
        if (jsonPayload.contractId && jsonPayload.type) {
            const parts = jsonPayload.contractId.split(':');
            if (parts[0] !== jsonPayload.type) {
                throw new TypeError('Invalid Contract Id (type)');
            }
            else if (parts.length < 3 || parts[1] !== '') {
                throw new errors_1.NameError('Invalid Contract Id');
            }
        }
        try {
            return contractValidator_1.validate(jsonPayload);
        }
        catch (error) {
            // ValdationError
            throw new errors_1.ValidationError(error);
        }
    }
    static serialize(req, data) {
        return contractSerializer_1.serialize(req, data);
    }
    static serializeCollection(req, data) {
        return contractSerializer_1.serializeCollection(req, data);
    }
}
exports.Contract = Contract;
