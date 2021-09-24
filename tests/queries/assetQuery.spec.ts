'use strict'
/* eslint-env node, mocha */

import { expect } from 'chai'
import { Asset, AssetQuery, AssetRepository, TNewAssetConfig } from '../../src'

describe('Asset Repository', () => {
    let assetRepository: AssetRepository
    let assetQuery: AssetQuery
    const testAssetId = 'card::test1'

    before(async () => {
        assetRepository = new AssetRepository()
        assetQuery = new AssetQuery(assetRepository)
    })

    describe('Create Full Asset', () => {
        it('should create and read back', async () => {
            const data: TNewAssetConfig = {
                ownerId: 'tester',
                symbol: testAssetId,
                displayName: 'display-me',
                leagueId: 'theLeagueId',
                leagueDisplayName: 'theLeagueDisplayName',

                tags: {
                    tag1: 'thisistag1',
                    tag2: 'thisistag1',
                },
            }

            const asset = Asset.newAsset(data)
            await assetRepository.storeAsync(asset)

            const readBack = await assetQuery.getDetailAsync(testAssetId)
            expect(readBack).to.exist
            if (readBack) {
                expect(readBack).to.have.property('tags')
                expect(readBack.tags).to.have.property('tag1')
            }
        })
    })
})
