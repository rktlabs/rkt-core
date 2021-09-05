'use strict'
/* eslint-env node, mocha */

import { expect } from 'chai'

import { Asset, TNewAsset } from '../../src/models'
import { AssetRepository } from '../../src/repositories'

describe('Asset Repository', () => {
    let assetRepository: AssetRepository
    const testAssetId = 'card::test1'

    before(async () => {
        assetRepository = new AssetRepository()
    })

    afterEach(async () => {
        // clean out records.
        await assetRepository.deleteAsset(testAssetId)
    })

    describe('Create Basic Asset', () => {
        it('should create and read back', async () => {
            const data: TNewAsset = {
                ownerId: 'tester',
                symbol: testAssetId,
                displayName: 'display-me',
                leagueId: 'theLeagueId',
                leagueDisplayName: 'theLeagueDisplayName',
            }

            const asset = Asset.newAsset(data)
            await assetRepository.storeAsset(asset)

            const readBack = await assetRepository.getAsset(testAssetId)
            expect(readBack).to.exist

            if (readBack) {
                expect(readBack.type).to.eq('card')
                expect(readBack.ownerId).to.eq('tester')
                expect(readBack.assetId).to.eq(testAssetId)
                expect(readBack.displayName).to.eq('display-me')
                expect(readBack.leagueId).to.eq('theLeagueId')
                expect(readBack.leagueDisplayName).to.eq('theLeagueDisplayName')
            }
        })
    })

    describe('Delete Asset', () => {
        it('should create and delete', async () => {
            const data: TNewAsset = {
                ownerId: 'tester',
                symbol: testAssetId,
                displayName: 'display-me',
                leagueId: 'theLeagueId',
                leagueDisplayName: 'theLeagueDisplayName',
            }

            const asset = Asset.newAsset(data)
            await assetRepository.storeAsset(asset)

            await assetRepository.deleteAsset(testAssetId)

            const readBack = await assetRepository.getAsset(testAssetId)
            expect(readBack).to.not.exist
        })
    })

    describe('Create Full Asset', () => {
        it('should create and read back', async () => {
            const data: TNewAsset = {
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
            await assetRepository.storeAsset(asset)

            const readBack = await assetRepository.getAsset(testAssetId)
            expect(readBack).to.exist
            if (readBack) {
                expect(readBack).to.have.property('tags')
                expect(readBack.tags).to.have.property('tag1')
            }
        })
    })

    describe('Get Assets', () => {
        it('should read list', async () => {
            const assetList = await assetRepository.listAssets({ pageSize: 2 })
            expect(assetList).to.exist
            expect(assetList.length).to.eq(2)
        })
    })

    describe('Get FilteredAssets', () => {
        it('should read filterred list', async () => {
            const assetList = await assetRepository.listAssets({ pageSize: 2, type: 'coin' })
            expect(assetList).to.exist
            expect(assetList.length).to.eq(1)
        })
    })
})
