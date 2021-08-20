import { DateTime } from 'luxon'
import { generateId } from '../../util/idGenerator'
import { ValidationError, TypeError, NameError } from '../../errors'
import { serialize, serializeCollection } from './portfolioSerializer'
import { validate } from './portfolioValidator'

export type TNewPortfolio = {
    type?: string // supply type OR portfolioId. If portfolioId specified, type is overridden
    portfolioId?: string
    ownerId: string
    displayName?: string
    tags?: any
    xids?: any
}

export type TPortfolioCache = {
    portfolioId: string
}

export type TPortfolioAsset = {
    portfolioId: string
    assetId: string
    units: number

    displayName: string
    cost: number
    net: number
}

export type TPortfolioDeposit = {
    createdAt: string
    portfolioId: string
    assetId: string
    units: number
}

export type TPortfolioAssetUpdateItem = {
    portfolioId: string
    assetId: string
    deltaUnits: number
    deltaNet: number
    deltaCost: number
}

export type TPortfolioAssetCache = {
    portfolioId: string
    assetId: string
    units: number
}

export type TPortfolio = {
    portfolioId: string
    createdAt: string
    type: string
    displayName: string
    ownerId: string
    tags?: any
    xids?: any

    deposits?: number
}

export type TPortfolioPatch = {
    displayName?: string
    tags?: any
    xids?: any
    deposits?: any
}

export class Portfolio {
    portfolioId: string
    createdAt: string
    type: string
    displayName: string
    ownerId: string
    tags?: any
    xids?: any

    deposits?: number

    constructor(props: TPortfolio) {
        this.portfolioId = props.portfolioId
        this.createdAt = props.createdAt
        this.type = props.type
        this.displayName = props.displayName
        this.ownerId = props.ownerId
        this.xids = props.xids
        this.tags = props.tags
        this.tags = props.tags
        this.deposits = props.deposits
    }

    // Member Properties for new model
    static newPortfolio(props: TNewPortfolio) {
        // can supply portfolioId or type. If supply portfolioId, it must embed type
        let type: string
        let portfolioId: string
        if (props.portfolioId) {
            const symbolParts = props.portfolioId.split(':')
            if (symbolParts.length < 2 || symbolParts[1] !== '') {
                throw new Error('New Portfolio: Invalid portfolioId')
            }
            type = symbolParts[0]
            portfolioId = props.portfolioId
        } else if (props.type) {
            portfolioId = `${props.type}::${generateId()}`
            type = props.type
        } else {
            throw new Error('New Portfolio: Invalid propertied - must supplie portfolioId or type')
        }

        const createdAt = DateTime.utc().toString()
        const displayName = props.displayName || portfolioId

        const newPortfolioProps: TPortfolio = {
            portfolioId,
            createdAt,
            displayName,

            ownerId: props.ownerId,
            type: type,
            xids: props.xids,
            tags: props.tags,
        }

        const newEntity = new Portfolio(newPortfolioProps)
        return newEntity
    }

    static serialize(req: any, data: any) {
        return serialize(req, data)
    }

    static serializeCollection(req: any, data: any) {
        return serializeCollection(req, data)
    }

    static validate(jsonPayload: any) {
        if (jsonPayload.portfolioId && jsonPayload.type) {
            const parts = jsonPayload.portfolioId.split(':')
            if (parts[0] !== jsonPayload.type) {
                throw new TypeError('Invalid Portfolio Id (type)')
            } else if (parts.length < 3 || parts[1] !== '') {
                throw new NameError('Invalid Portfolio Id')
            }
        }

        try {
            return validate(jsonPayload)
        } catch (error) {
            // ValdationError
            throw new ValidationError(error)
        }
    }
}
