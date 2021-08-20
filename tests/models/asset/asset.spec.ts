'use strict'
/* eslint-env node, mocha */
import { expect } from 'chai'

import { Asset, TNewAsset } from '../../../src/models'

describe('Asset', () => {
    const assetId = 'card::the.card'

    describe('Create New Asset', () => {
        it('new asset should have no portfolioId', async () => {
            const data: TNewAsset = {
                symbol: assetId,
                ownerId: 'tester',
                contractId: 'theContractId',
                earnerId: 'theEarnerId',
            }

            const asset = Asset.newAsset(data)
            expect(asset.portfolioId).to.not.exist
        })

        it('no displayname should default to assetId', async () => {
            const data: TNewAsset = {
                symbol: assetId,
                ownerId: 'tester',
                contractId: 'theContractId',
                earnerId: 'theEarnerId',
            }

            const asset = Asset.newAsset(data)
            expect(asset.displayName).to.eq(assetId)
            expect(asset.portfolioId).to.not.exist
        })

        it('no contractDisplayName should default to contrctId', async () => {
            const data: TNewAsset = {
                symbol: assetId,
                ownerId: 'tester',
                contractId: 'theContractId',
                earnerId: 'theEarnerId',
            }

            const asset = Asset.newAsset(data)
            expect(asset.contractDisplayName).to.eq('theContractId')
        })

        it('use displayName if supplied', async () => {
            const displayName = 'thisisme'

            const data: TNewAsset = {
                symbol: assetId,
                ownerId: 'tester',
                displayName: 'thisisme',
                contractId: 'theContractId',
                earnerId: 'theEarnerId',
            }

            const asset = Asset.newAsset(data)
            expect(asset.displayName).to.eq(displayName)
        })

        it('use contractDisplayName if supplied', async () => {
            const displayName = 'thisisme'

            const data: TNewAsset = {
                symbol: assetId,
                ownerId: 'tester',
                contractId: 'theContractId',
                contractDisplayName: 'theContractDisplayName',
                earnerId: 'theEarnerId',
            }

            const asset = Asset.newAsset(data)
            expect(asset.contractDisplayName).to.eq('theContractDisplayName')
        })
    })
})
