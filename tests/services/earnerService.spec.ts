'use strict'
/* eslint-env node, mocha */

import { assert, expect } from 'chai'
import * as sinon from 'sinon'
import { EventPublisher } from '../../src/services'

import * as firebase from 'firebase-admin'

import { EarnerService, BootstrapService } from '../../src/services'
import { EarnerRepository } from '../../src/repositories'
import { TNewEarner } from '../../src'

describe('Earner Service', function () {
    this.timeout(5000)

    let earnerRepository: EarnerRepository
    let earnerService: EarnerService
    let bootstrapper: BootstrapService
    let eventPublisher: sinon.SinonStubbedInstance<EventPublisher>
    let earnerId: string = 'card::test1'

    before(async () => {
        const db = firebase.firestore()
        eventPublisher = sinon.createStubInstance(EventPublisher)

        earnerRepository = new EarnerRepository(db)
        earnerService = new EarnerService(db, eventPublisher as any as EventPublisher)

        bootstrapper = new BootstrapService(db, eventPublisher as any as EventPublisher)
        await bootstrapper.clearDb()
    })

    beforeEach(async () => {
        await earnerService.scrubEarner(earnerId)
    })

    describe('Create Basic Earner', () => {
        it('should create', async () => {
            const data: TNewEarner = {
                ownerId: 'tester',
                symbol: earnerId,
                displayName: 'display-me',
            }

            await earnerService.newEarner(data)

            const readBack = await earnerRepository.getEarner(earnerId)
            expect(readBack!!).to.exist
            expect(readBack!!.ownerId).to.eq('tester')
            expect(readBack!!.scale).to.eq(1)
            expect(readBack!!.cumulativeEarnings).to.eq(0)
            expect(readBack!!.symbol).to.eq(earnerId)
            expect(readBack!!.displayName).to.eq('display-me')
        })
    })

    describe('Create Earner where already exists', () => {
        it('should not create anything', async () => {
            const data: TNewEarner = {
                ownerId: 'tester',
                symbol: earnerId,
            }

            await earnerService.newEarner(data)
            const readBack = await earnerRepository.getEarner(earnerId)
            expect(readBack).to.exist

            await earnerService
                .newEarner(data)
                .then(() => {
                    assert.fail('Function should not complete')
                })
                .catch((error: any) => {
                    expect(error).to.be.instanceOf(Error)
                    expect(error.message).to.eq('Earner Creation Failed - earnerId: card::test1 already exists')
                })
        })
    })
})
