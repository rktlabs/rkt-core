"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Portfolio = void 0;
const luxon_1 = require("luxon");
const idGenerator_1 = require("../../util/idGenerator");
const errors_1 = require("../../errors");
const portfolioSerializer_1 = require("./portfolioSerializer");
const portfolioValidator_1 = require("./portfolioValidator");
class Portfolio {
    constructor(props) {
        this.portfolioId = props.portfolioId;
        this.createdAt = props.createdAt;
        this.type = props.type;
        this.displayName = props.displayName;
        this.ownerId = props.ownerId;
        this.xids = props.xids;
        this.tags = props.tags;
        this.tags = props.tags;
        this.deposits = props.deposits;
    }
    // Member Properties for new model
    static newPortfolio(props) {
        // can supply portfolioId or type. If supply portfolioId, it must embed type
        let type;
        let portfolioId;
        if (props.portfolioId) {
            const symbolParts = props.portfolioId.split(':');
            if (symbolParts.length < 2 || symbolParts[1] !== '') {
                throw new Error('New Portfolio: Invalid portfolioId');
            }
            type = symbolParts[0];
            portfolioId = props.portfolioId;
        }
        else if (props.type) {
            portfolioId = `${props.type}::${idGenerator_1.generateId()}`;
            type = props.type;
        }
        else {
            throw new Error('New Portfolio: Invalid propertied - must supplie portfolioId or type');
        }
        const createdAt = luxon_1.DateTime.utc().toString();
        const displayName = props.displayName || portfolioId;
        const newPortfolioProps = {
            portfolioId,
            createdAt,
            displayName,
            ownerId: props.ownerId,
            type: type,
            xids: props.xids,
            tags: props.tags,
        };
        const newEntity = new Portfolio(newPortfolioProps);
        return newEntity;
    }
    static serialize(req, data) {
        return portfolioSerializer_1.serialize(req, data);
    }
    static serializeCollection(req, data) {
        return portfolioSerializer_1.serializeCollection(req, data);
    }
    static validate(jsonPayload) {
        if (jsonPayload.portfolioId && jsonPayload.type) {
            const parts = jsonPayload.portfolioId.split(':');
            if (parts[0] !== jsonPayload.type) {
                throw new errors_1.TypeError('Invalid Portfolio Id (type)');
            }
            else if (parts.length < 3 || parts[1] !== '') {
                throw new errors_1.NameError('Invalid Portfolio Id');
            }
        }
        try {
            return portfolioValidator_1.validate(jsonPayload);
        }
        catch (error) {
            // ValdationError
            throw new errors_1.ValidationError(error);
        }
    }
}
exports.Portfolio = Portfolio;
