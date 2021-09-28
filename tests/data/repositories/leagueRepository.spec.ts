'use strict'
/* eslint-env node, mocha */

import { expect } from 'chai'

import { DateTime } from 'luxon'
import { League } from '../../../src/models'
import { LeagueRepository } from '../../../src/repositories'

describe('League Repository', () => {
    let leagueRepository: LeagueRepository
    const leagueId = 'test1'

    before(async () => {
        leagueRepository = new LeagueRepository()
    })

    beforeEach(async () => {
        await leagueRepository.deleteAsync(leagueId)
    })

    describe('Create Basic League', () => {
        it('should create', async () => {
            const data = {
                ownerId: 'tester',
                leagueId: leagueId,
                portfolioId: `league::${leagueId}`,
            }

            const league = League.newLeague(data)
            await leagueRepository.storeAsync(league)

            const readBack = await leagueRepository.getDetailAsync(leagueId)
            expect(readBack).to.exist
            expect(readBack!!.ownerId).to.eq('tester')
            expect(readBack!!.portfolioId).to.eq(`league::${leagueId}`)
        })
    })

    describe('Create League with Assets', () => {
        it('should create 1 managedAssets', async () => {
            const data = {
                ownerId: 'tester',
                leagueId: leagueId,
                portfolioId: `league::${leagueId}`,
            }

            const league = League.newLeague(data)
            await leagueRepository.storeAsync(league)

            await leagueRepository.attachLeagueAsset(league.leagueId, {
                assetId: 'card::asset1',
                displayName: 'card::asset1',
            })
            await leagueRepository.attachLeagueAsset(league.leagueId, {
                assetId: 'card::asset2',
                displayName: 'card::asset2',
            })

            const readBack = await leagueRepository.getDetailAsync(leagueId)
            expect(readBack).to.exist
            expect(readBack!!.managedAssets).to.be.instanceOf(Array)
            expect(readBack!!.managedAssets.length).to.eq(2)
        })
    })

    describe('Create League with Assets', () => {
        it('should delete managedAsset', async () => {
            const data = {
                ownerId: 'tester',
                leagueId: leagueId,
                portfolioId: `league::${leagueId}`,
            }

            const league = League.newLeague(data)
            await leagueRepository.storeAsync(league)

            await leagueRepository.attachLeagueAsset(league.leagueId, {
                assetId: 'card::asset1',
                displayName: 'card::asset1',
            })
            await leagueRepository.attachLeagueAsset(league.leagueId, {
                assetId: 'card::asset2',
                displayName: 'card::asset2',
            })

            await leagueRepository.detachLeagueAsset(league.leagueId, 'card::asset1')

            const readBack = await leagueRepository.getDetailAsync(leagueId)
            expect(readBack).to.exist
            expect(readBack!!.managedAssets).to.be.instanceOf(Array)
            expect(readBack!!.managedAssets.length).to.eq(1)
            expect(readBack!!.managedAssets[0].assetId).to.eq('card::asset2')
        })
    })
})
