"use strict";
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
            startAt: props.startAt || createdAt,
            endAt: props.endAt,
            acceptEarningsAfter: props.acceptEarningsAfter || props.startAt || createdAt,
            ignoreEarningsAfter: props.ignoreEarningsAfter || props.endAt,
            key: props.key,
            pt: props.pt,
            //playerList: props.earnerList,
            managedAssets: [],
            currencyId: 'coin::fantx',
            currencySource: 'league::mint',
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
