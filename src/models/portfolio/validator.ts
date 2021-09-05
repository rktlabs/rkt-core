import { Schema, Validator } from 'jsonschema'

export const validate = (jsonPayload: any) => {
    const validation = _validatePortfolioSchema(jsonPayload, _portfolioSchema)
    return validation
}

const _portfolioSchema: Schema = {
    $schema: 'http://json-schema.org/draft-07/schema#',

    type: 'object',
    properties: {
        type: {
            type: ['mint', 'bank', 'asset', 'user', 'pool', 'maker'],
        },
        portfolioId: { type: 'string' },
        displayName: { type: 'string' },
        ownerId: { type: 'string' },
        initialDeposit: { type: 'number' },
    },
    required: ['type', 'name', 'ownerId'],
}

const _validatePortfolioSchema = (jsonPayload: any, schema: any) => {
    const v = new Validator()
    const validation = v.validate(jsonPayload, schema)
    if (validation.errors && validation.errors.length > 0) {
        const validationError = validation.errors[0]
        // delete validationError.schema;
        // delete validationError.instance;
        throw validationError
    }
    return validation
}
