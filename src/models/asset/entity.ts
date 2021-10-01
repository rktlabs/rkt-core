'use strict'

import { DateTime } from 'luxon'
import { TAsset, TNewAssetConfig } from '.'
import { ValidationError, TypeError, NameError } from '../../errors'
import { validate } from './validator'

// Asset holds value (coin) and shares to be sold.
export class Asset {
    createdAt: string
    type: string
    symbol: string
    assetId: string
    displayName: string
    ownerId: string
    portfolioId?: string

    leagueId?: string
    leagueDisplayName?: string

    issuedUnits: number
    burnedUnits: number

    subject?: string

    tags?: any
    xids?: any

    quote?: any

    constructor(props: TAsset) {
        this.createdAt = props.createdAt
        this.type = props.type
        this.symbol = props.symbol
        this.assetId = props.assetId
        this.displayName = props.displayName
        this.ownerId = props.ownerId
        this.portfolioId = props.portfolioId

        this.leagueId = props.leagueId
        this.leagueDisplayName = props.leagueDisplayName

        this.issuedUnits = props.issuedUnits
        this.burnedUnits = props.burnedUnits

        this.subject = props.subject

        this.xids = props.xids
        this.tags = props.tags

        this.quote = props.quote
    }

    toString() {
        return `[asset: ${this.assetId}]`
    }

    static newAsset(props: TNewAssetConfig) {
        const symbolParts = props.symbol.split(':')
        if (symbolParts.length < 2 || symbolParts[1] !== '') {
            throw new Error('New Asset: Invalid symbol')
        }

        const type = symbolParts[0]
        const assetId = props.symbol
        const createdAt = DateTime.utc().toString()
        const displayName = props.displayName || assetId

        const assetProps: TAsset = {
            assetId,
            createdAt,
            displayName,
            ownerId: props.ownerId,
            type: type,
            symbol: props.symbol,
            leagueId: props.leagueId,
            leagueDisplayName: props.leagueDisplayName || props.leagueId,
            subject: props.subject,
            issuedUnits: 0,
            burnedUnits: 0,
        }

        if (props.tags) {
            assetProps.tags = Object.assign({}, props.tags)
        }

        if (props.xids) {
            assetProps.xids = Object.assign({}, props.xids)
        }

        const newEntity = new Asset(assetProps)
        return newEntity
    }

    static validate(jsonPayload: any) {
        if (jsonPayload.assetId && jsonPayload.type) {
            const parts = jsonPayload.assetId.split(':')
            if (parts[0] !== jsonPayload.type) {
                throw new TypeError('Invalid Asset Id (type)')
            } else if (parts.length < 3 || parts[1] !== '') {
                throw new NameError('Invalid Asset Id')
            }
        }

        try {
            return validate(jsonPayload)
        } catch (error) {
            throw new ValidationError(error)
        }
    }
}
