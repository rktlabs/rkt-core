'use strict'
/* eslint-env node, mocha */
import { expect } from 'chai'

import { Asset, TNewAssetConfig } from '../../../src/models'

describe('Asset', () => {
    const assetId = 'card::the.card'

    describe('Create New Asset', () => {
        it('new asset should have no portfolioId', async () => {
            const data: TNewAssetConfig = {
                symbol: assetId,
                ownerId: 'tester',
                leagueId: 'theLeagueId',
            }

            const asset = Asset.newAsset(data)
            expect(asset.portfolioId).to.not.exist
        })

        it('no displayname should default to assetId', async () => {
            const data: TNewAssetConfig = {
                symbol: assetId,
                ownerId: 'tester',
                leagueId: 'theLeagueId',
            }

            const asset = Asset.newAsset(data)
            expect(asset.displayName).to.eq(assetId)
            expect(asset.portfolioId).to.not.exist
        })

        it('no leagueDisplayName should default to contrctId', async () => {
            const data: TNewAssetConfig = {
                symbol: assetId,
                ownerId: 'tester',
                leagueId: 'theLeagueId',
            }

            const asset = Asset.newAsset(data)
            expect(asset.leagueDisplayName).to.eq('theLeagueId')
        })

        it('use displayName if supplied', async () => {
            const displayName = 'thisisme'

            const data: TNewAssetConfig = {
                symbol: assetId,
                ownerId: 'tester',
                displayName: 'thisisme',
                leagueId: 'theLeagueId',
            }

            const asset = Asset.newAsset(data)
            expect(asset.displayName).to.eq(displayName)
        })

        it('use leagueDisplayName if supplied', async () => {
            const data: TNewAssetConfig = {
                symbol: assetId,
                ownerId: 'tester',
                leagueId: 'theLeagueId',
                leagueDisplayName: 'theLeagueDisplayName',
            }

            const asset = Asset.newAsset(data)
            expect(asset.leagueDisplayName).to.eq('theLeagueDisplayName')
        })
    })
})
