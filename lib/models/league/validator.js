"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const jsonschema_1 = require("jsonschema");
const validate = (jsonPayload) => {
    const validation = _validateLeagueSchema(jsonPayload, _leagueSchema);
    return validation;
};
exports.validate = validate;
const _leagueSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {
        ownerId: { type: 'string' },
        displayName: { type: 'string' },
        startAt: { type: 'string' },
        endAt: { type: 'string' },
        key: { type: 'string' },
        pt: { type: 'number' },
    },
    required: ['displayName', 'startAt', 'endAt', 'key', 'pt'],
};
const _validateLeagueSchema = (jsonPayload, schema) => {
    const v = new jsonschema_1.Validator();
    const validation = v.validate(jsonPayload, schema);
    if (validation.errors && validation.errors.length > 0) {
        const validationError = validation.errors[0];
        if (validationError) {
            // delete validationError.schema
            // delete validationError.instance
        }
        throw validationError;
    }
    return validation;
};
