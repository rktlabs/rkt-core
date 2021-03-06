'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const validator_1 = require("./validator");
const luxon_1 = require("luxon");
const errors_1 = require("../../errors");
const idGenerator_1 = require("../../util/idGenerator");
// User holds value (coin) and shares to be sold.
class User {
    constructor(props) {
        this.createdAt = props.createdAt;
        this.dob = props.dob;
        this.email = props.email;
        this.userId = props.userId;
        this.id = props.id;
        this.name = props.name;
        this.username = props.username;
        this.displayName = props.displayName;
        this.portfolioId = props.portfolioId;
        this.tags = props.tags;
        this.isNew = props.isNew;
        this.referrerId = props.referrerId;
    }
    toString() {
        return `[user: ${this.userId}]`;
    }
    // Member Properties for new model
    static newUser(props) {
        let userId;
        if (props.userId) {
            userId = props.userId;
        }
        else {
            userId = `${(0, idGenerator_1.generateId)()}`;
        }
        const createdAt = luxon_1.DateTime.utc().toString();
        const displayName = props.displayName || props.name || props.username;
        const userProps = {
            userId,
            id: userId,
            createdAt,
            displayName,
            dob: props.dob,
            email: props.email,
            name: props.name,
            username: props.username,
            referrerId: props.referrerId,
            isNew: true,
        };
        if (props.tags) {
            userProps.tags = Object.assign({}, props.tags);
        }
        const newEntity = new User(userProps);
        return newEntity;
    }
    static validate(jsonPayload) {
        if (jsonPayload.userId && jsonPayload.type) {
            const parts = jsonPayload.userId.split(':');
            if (parts[0] !== jsonPayload.type) {
                throw new TypeError('Invalid User Id (type)');
            }
            else if (parts.length < 3 || parts[1] !== '') {
                throw new errors_1.NameError('Invalid User Id');
            }
        }
        try {
            return (0, validator_1.validate)(jsonPayload);
        }
        catch (error) {
            // ValdationError
            throw new errors_1.ValidationError(error);
        }
    }
}
exports.User = User;
