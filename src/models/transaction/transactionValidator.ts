'use strict'

import { Schema, Validator } from 'jsonschema'

const schema: Schema = {
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
}

export const validate = (transactionJson: any) => {
    const v = new Validator()
    const validation = v.validate(transactionJson, schema)
    if (validation.errors && validation.errors.length > 0) {
        const validationError = validation.errors[0]
        // delete validationError.schema;
        // delete validationError.instance;
        throw validationError
    }
}
