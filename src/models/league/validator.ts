import { Validator } from 'jsonschema'

export const validate = (jsonPayload: any) => {
    const validation = _validateLeagueSchema(jsonPayload, _leagueSchema)
    return validation
}

const _leagueSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',

    type: 'object',
    properties: {
        ownerId: { type: 'string' },
        displayName: { type: 'string' },
    },
    required: ['displayName'],
}

const _validateLeagueSchema = (jsonPayload: any, schema: any) => {
    const v = new Validator()
    const validation = v.validate(jsonPayload, schema)
    if (validation.errors && validation.errors.length > 0) {
        const validationError = validation.errors[0]
        if (validationError) {
            // delete validationError.schema
            // delete validationError.instance
        }
        throw validationError
    }
    return validation
}
