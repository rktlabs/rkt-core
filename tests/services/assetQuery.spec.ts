'use strict'
/* eslint-env node, mocha */

import { expect } from 'chai'
import { AssetQuery } from '../../src'

import { Asset, TNewAsset } from '../../src/models'

describe('Asset Repository', () => {
    let assetQuery: AssetQuery
    const assetId = 'card::test1'

    before(async () => {
        //const db = firebase.firestore()
        assetQuery = new AssetQuery()
    })
})
