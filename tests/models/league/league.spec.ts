'use strict'
/* eslint-env node, mocha */
import { expect } from 'chai'

import { League, TNewLeague } from '../../../src/models'

describe('League', () => {
    const leagueId = 'my-league'

    describe('Create New League', () => {
        it('no displayname should default to leagueId', async () => {
            const data: TNewLeague = {
                ownerId: 'tester',
                leagueId: leagueId,
            }

            const league = League.newLeague(data)
            expect(league.displayName).to.eq(leagueId)
        })

        it('use displayName if supplied', async () => {
            const displayName = 'thisisme'

            const data: TNewLeague = {
                ownerId: 'tester',
                leagueId: leagueId,
                displayName: displayName,
            }

            const league = League.newLeague(data)
            expect(league.displayName).to.eq(displayName)
        })
    })
})
