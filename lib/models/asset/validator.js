'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const jsonschema_1 = require("jsonschema");
const validate = (jsonPayload) => {
    const validation = _validateAssetSchema(jsonPayload, _assetSchema);
    return validation;
};
exports.validate = validate;
const _assetSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {
        ownerId: { type: 'string' },
        type: { type: { enum: ['coin', 'card', 'pack'] } },
        assetId: { type: 'string' },
        symbol: { type: 'string' },
        displayName: { type: 'string' },
        leagueId: { type: 'string' },
        leagueDisplayName: { type: 'string' },
    },
    required: ['ownerId', 'symbol', 'type', 'leagueId', 'earnerId', 'displayName'],
};
const _validateAssetSchema = (jsonPayload, schema) => {
    const v = new jsonschema_1.Validator();
    const validation = v.validate(jsonPayload, schema);
    if (validation.errors && validation.errors.length > 0) {
        const validationError = validation.errors[0];
        if (validationError) {
        }
        throw validationError;
    }
    return validation;
};
