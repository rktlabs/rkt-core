'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.League = void 0;
const errors_1 = require("../../errors");
const luxon_1 = require("luxon");
const idGenerator_1 = require("../../util/idGenerator");
const serializer_1 = require("./serializer");
const validator_1 = require("./validator");
// League holds value (coin) and shares to be sold.
class League {
    constructor(props) {
        this.createdAt = props.createdAt;
        this.leagueId = props.leagueId;
        this.ownerId = props.ownerId;
        this.portfolioId = props.portfolioId;
        this.displayName = props.displayName || props.leagueId;
        this.description = props.description || this.displayName;
        this.tags = props.tags;
        this.managedAssets = props.managedAssets;
    }
    // Member Properties for new model
    static newLeague(props) {
        const leagueId = props.leagueId || `${(0, idGenerator_1.generateId)()}`;
        const createdAt = luxon_1.DateTime.utc().toString();
        const displayName = props.displayName || leagueId;
        const description = props.displayName || displayName;
        const portfolioId = `league::${leagueId}`;
        const leagueProps = {
            leagueId,
            createdAt,
            displayName,
            description,
            ownerId: props.ownerId,
            portfolioId: portfolioId,
            managedAssets: [],
        };
        if (props.tags) {
            leagueProps.tags = Object.assign({}, props.tags);
        }
        const newEntity = new League(leagueProps);
        return newEntity;
    }
    static validate(jsonPayload) {
        if (jsonPayload.leagueId && jsonPayload.type) {
            const parts = jsonPayload.leagueId.split(':');
            if (parts[0] !== jsonPayload.type) {
                throw new TypeError('Invalid League Id (type)');
            }
            else if (parts.length < 3 || parts[1] !== '') {
                throw new errors_1.NameError('Invalid League Id');
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
exports.League = League;
