'use strict'
/* eslint-env node, mocha */

import { expect } from 'chai'

import * as firebase from 'firebase-admin'

import { User, TNewUser } from '../../src/models'
import { UserRepository } from '../../src/repositories'

describe('User Repository', () => {
    let userRepository: UserRepository

    before(async () => {
        const db = firebase.firestore()
        userRepository = new UserRepository(db)
    })

    describe('Create Basic User', () => {
        it('should create', async () => {
            const data: TNewUser = {
                dob: '1/2/2021',
                email: 'bjcleaver@cleaver.com',
                name: 'Boris Cleaver',
                username: 'bjcleaver',
            }

            const user = User.newUser(data)
            await userRepository.storeUser(user)

            const userId = user.userId

            const readBack = await userRepository.getUser(userId)
            expect(readBack).to.exist
            expect(readBack!!.userId).to.exist

            await userRepository.deleteUser(userId)
        })
    })

    describe('Create Full User', () => {
        it('should create', async () => {
            const data: TNewUser = {
                dob: '1/2/2021',
                email: 'bjcleaver@cleaver.com',
                name: 'Boris Cleaver',
                username: 'bjcleaver',
                displayName: 'aaa',
                tags: {
                    tag1: 'thisistag1',
                    tag2: 'thisistag1',
                },
            }

            const user = User.newUser(data)
            await userRepository.storeUser(user)
            const userId = user.userId

            const readBack = await userRepository.getUser(userId)
            expect(readBack).to.exist
            if (readBack) {
                expect(readBack.dob).to.eq('1/2/2021')
                expect(readBack.email).to.eq('bjcleaver@cleaver.com')
                expect(readBack.name).to.eq('Boris Cleaver')
                expect(readBack.username).to.eq('bjcleaver')
                expect(readBack.displayName).to.eq('aaa')
                expect(readBack).to.have.property('tags')
                expect(readBack.tags).to.have.property('tag1')
            }
            await userRepository.deleteUser(userId)
        })
    })

    describe('Filtered Users', () => {
        it('should list users', async () => {
            const users: User[] = []

            users.push(
                User.newUser({
                    dob: '1/2/2021',
                    email: 'b1@cleaver.com',
                    name: 'Boris Cleaver',
                    username: 'bjcleaver1',
                }),
            )

            users.push(
                User.newUser({
                    dob: '1/2/2021',
                    email: 'b2@cleaver.com',
                    name: 'Ben Cleaver',
                    username: 'bjcleaver2',
                }),
            )

            users.push(
                User.newUser({
                    dob: '1/2/2021',
                    email: 'b3@cleaver.com',
                    name: 'Betty Cleaver',
                    username: 'bjcleaver3',
                }),
            )

            users.push(
                User.newUser({
                    dob: '1/2/2021',
                    email: 'b4@cleaver.com',
                    name: 'Blake Cleaver',
                    username: 'bjcleaver4',
                }),
            )

            {
                const promises: any[] = []
                users.forEach((user) => {
                    promises.push(userRepository.storeUser(user))
                })
                await Promise.all(promises)
            }

            const userList = await userRepository.listUsers({ username: 'bjcleaver4' })
            expect(userList.length).to.eq(1)
            expect(userList[0].username).to.eql('bjcleaver4')

            {
                const promises: any[] = []
                users.forEach((user) => {
                    promises.push(userRepository.deleteUser(user.userId))
                })
                await Promise.all(promises)
            }
        })
    })
})
