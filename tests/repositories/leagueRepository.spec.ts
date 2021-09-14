'use strict'
/* eslint-env node, mocha */

import { expect } from 'chai'

import { DateTime } from 'luxon'
import { League } from '../../src/models'
import { LeagueRepository } from '../../src/repositories'

describe('League Repository', () => {
    let leagueRepository: LeagueRepository
    const leagueId = 'card::test1'

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
                startAt: DateTime.local(2020, 8, 15).toString(),
                endAt: DateTime.local(2020, 12, 31).toString(),
                key: 'seasons',
                pt: 1,
            }

            const league = League.newLeague(data)
            await leagueRepository.storeAsync(league)

            await leagueRepository.addLeagueAsset(league.leagueId, {
                assetId: 'card::asset1',
                displayName: 'card::asset1',
            })
            await leagueRepository.addLeagueAsset(league.leagueId, {
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
                startAt: DateTime.local(2020, 8, 15).toString(),
                endAt: DateTime.local(2020, 12, 31).toString(),
                key: 'seasons',
                pt: 1,
            }

            const league = League.newLeague(data)
            await leagueRepository.storeAsync(league)

            await leagueRepository.addLeagueAsset(league.leagueId, {
                assetId: 'card::asset1',
                displayName: 'card::asset1',
            })
            await leagueRepository.addLeagueAsset(league.leagueId, {
                assetId: 'card::asset2',
                displayName: 'card::asset2',
            })

            await leagueRepository.dropLeagueAsset(league.leagueId, 'card::asset1')

            const readBack = await leagueRepository.getDetailAsync(leagueId)
            expect(readBack).to.exist
            expect(readBack!!.managedAssets).to.be.instanceOf(Array)
            console.log(readBack!!.managedAssets)
            expect(readBack!!.managedAssets.length).to.eq(1)
            expect(readBack!!.managedAssets[0].assetId).to.eq('card::asset2')
        })
    })
})