'use strict'
/* eslint-env node, mocha */

import { expect } from 'chai'

import * as firebase from 'firebase-admin'

import { Asset, TNewAsset } from '../../src/models'
import { AssetRepository } from '../../src/repositories'

describe('Asset Repository', () => {
    let assetRepository: AssetRepository
    const assetId = 'card::test1'

    before(async () => {
        const db = firebase.firestore()
        assetRepository = new AssetRepository(db)
    })

    afterEach(async () => {
        // clean out records.
        await assetRepository.deleteAsset(assetId)
    })

    describe('Create Basic Asset', () => {
        it('should create', async () => {
            const data: TNewAsset = {
                ownerId: 'tester',
                symbol: assetId,
                displayName: 'display-me',
                contractId: 'theContractId',
                contractDisplayName: 'theContractDisplayName',
                earnerId: 'theEarnerId',
                earnerDisplayName: 'theEarnerDisplayName',
            }

            const asset = Asset.newAsset(data)
            await assetRepository.storeAsset(asset)

            const readBack = await assetRepository.getAsset(assetId)
            expect(readBack).to.exist
        })
    })

    describe('Create Full Asset', () => {
        it('should create', async () => {
            const data: TNewAsset = {
                ownerId: 'tester',
                symbol: assetId,
                displayName: 'display-me',
                contractId: 'theContractId',
                contractDisplayName: 'theContractDisplayName',
                earnerId: 'theEarnerId',
                earnerDisplayName: 'theEarnerDisplayName',
                tags: {
                    tag1: 'thisistag1',
                    tag2: 'thisistag1',
                },
                xids: {
                    id1: 'xxx',
                    id2: 'yyy',
                },
            }

            const asset = Asset.newAsset(data)
            await assetRepository.storeAsset(asset)

            const readBack = await assetRepository.getAsset(assetId)
            expect(readBack).to.exist
            if (readBack) {
                expect(readBack.type).to.eq('card')
                expect(readBack.ownerId).to.eq('tester')
                expect(readBack.assetId).to.eq(assetId)
                expect(readBack.displayName).to.eq('display-me')

                expect(readBack).to.have.property('tags')
                expect(readBack.tags).to.have.property('tag1')
                expect(readBack).to.have.property('xids')
                expect(readBack.xids).to.have.property('id1')
            }
        })
    })
})
