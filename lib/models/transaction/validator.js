'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const jsonschema_1 = require("jsonschema");
const schema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    definitions: {
        leg: {
            type: 'object',
            properties: {
                portfolioId: { type: 'string' },
                assetId: { type: 'string' },
                units: { type: 'number' },
            },
            required: ['portfolioId', 'assetId', 'units'],
        },
    },
    type: 'object',
    properties: {
        xids: { type: 'object' },
        tags: { type: 'object' },
        inputs: {
            type: 'array',
            items: { $ref: '#/definitions/leg' },
        },
        outputs: {
            type: 'array',
            items: { $ref: '#/definitions/leg' },
        },
    },
    required: ['inputs', 'outputs'],
};
const validate = (transactionJson) => {
    const v = new jsonschema_1.Validator();
    const validation = v.validate(transactionJson, schema);
    if (validation.errors && validation.errors.length > 0) {
        const validationError = validation.errors[0];
        // delete validationError.schema;
        // delete validationError.instance;
        throw validationError;
    }
};
exports.validate = validate;
