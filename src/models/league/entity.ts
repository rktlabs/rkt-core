import { NameError, ValidationError } from '../../errors'
import { DateTime } from 'luxon'
import { generateId } from '../../util/idGenerator'
import { serialize, serializeCollection } from './serializer'
import { validate } from './validator'
import { TLeague, TNewLeagueConfig } from '.'
import { TAssetCore } from '..'

// League holds value (coin) and shares to be sold.
export class League {
    createdAt: string
    leagueId: string
    ownerId: string
    portfolioId: string
    displayName: string
    description: string
    tags?: any
    managedAssets: TAssetCore[]

    constructor(props: TLeague) {
        this.createdAt = props.createdAt
        this.leagueId = props.leagueId
        this.ownerId = props.ownerId
        this.portfolioId = props.portfolioId
        this.displayName = props.displayName || props.leagueId
        this.description = props.description || this.displayName
        this.tags = props.tags
        this.managedAssets = props.managedAssets
    }

    // Member Properties for new model
    static newLeague(props: TNewLeagueConfig) {
        const leagueId = props.leagueId || `${generateId()}`
        const createdAt = DateTime.utc().toString()
        const displayName = props.displayName || leagueId
        const description = props.displayName || displayName
        const portfolioId = `league::${leagueId}`

        const leagueProps: TLeague = {
            leagueId,
            createdAt,
            displayName,
            description,
            ownerId: props.ownerId,
            portfolioId: portfolioId,
            managedAssets: [],
        }

        if (props.tags) {
            leagueProps.tags = Object.assign({}, props.tags)
        }

        const newEntity = new League(leagueProps)
        return newEntity
    }

    static validate(jsonPayload: any) {
        if (jsonPayload.leagueId && jsonPayload.type) {
            const parts = jsonPayload.leagueId.split(':')
            if (parts[0] !== jsonPayload.type) {
                throw new TypeError('Invalid League Id (type)')
            } else if (parts.length < 3 || parts[1] !== '') {
                throw new NameError('Invalid League Id')
            }
        }

        try {
            return validate(jsonPayload)
        } catch (error) {
            throw new ValidationError(error)
        }
    }

    static serialize(selfUrl: string, baseUrl: string, data: any) {
        return serialize(selfUrl, baseUrl, data)
    }

    static serializeCollection(selfUrl: string, baseUrl: string, qs: any, data: any) {
        return serializeCollection(selfUrl, baseUrl, qs, data)
    }
}
