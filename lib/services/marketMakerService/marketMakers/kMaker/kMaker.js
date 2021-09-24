"use strict";
// 'use strict'
// import { DateTime } from 'luxon'
// import { round4 } from '../../../..'
// import { MarketMakerBase } from '../../marketMakerBase/entity'
// import { TNewMarketMakerConfig, TMarketMaker, TMakerResult } from '../../marketMakerBase/types'
// import admin = require('firebase-admin')
// const FieldValue = admin.firestore.FieldValue
// type TKMakerParams = {
//     madeUnits: number
//     x0: number
//     poolUnits: number
//     poolCoins: number
//     k: number
// }
// export class KMaker extends MarketMakerBase {
//     static newMaker(props: TNewMarketMakerConfig) {
//         const createdAt = DateTime.utc().toString()
//         const type = props.type
//         const assetId = props.assetId
//         const makerProps: TMarketMaker = {
//             createdAt,
//             type,
//             assetId,
//             ownerId: props.ownerId,
//             currentPrice: props.settings?.initPrice,
//         }
//         const newEntity = new KMaker(makerProps)
//         newEntity.params = newEntity.computeInitialState(props)
//         return newEntity
//     }
//     constructor(props: TMarketMaker) {
//         super(props)
//     }
//     async processOrderImpl(orderSide: string, orderSize: number) {
//         ////////////////////////////////////////////////////////
//         // Process the order
//         ////////////////////////////////////////////////////////
//         // for bid (a buy) I'm "removing" units from the pool, so flip sign
//         const signedOrderSize = orderSide === 'ask' ? orderSize * -1 : orderSize
//         const taken = this.processAMMOrderImpl(signedOrderSize)
//         if (taken) {
//             const data = taken.stateUpdate
//             await this.marketMakerRepository.updateMakerStateAsync(this.assetId, data)
//             return taken
//         } else {
//             return null
//         }
//     }
//     ////////////////////////////////////////////////////////
//     // PRIVATE
//     ////////////////////////////////////////////////////////
//     private computeInitialState(newMakerConfig: TNewMarketMakerConfig) {
//         const initMadeUnits = newMakerConfig.settings?.initMadeUnits || 0
//         const initPrice = newMakerConfig.settings?.initPrice || 1
//         const initialPoolUnits = newMakerConfig.settings?.initialPoolUnits || 1000
//         const poolUnits = initialPoolUnits - initMadeUnits
//         const poolCoins = poolUnits * initPrice
//         const k = poolUnits * poolCoins
//         const makerState: TKMakerParams = {
//             madeUnits: initMadeUnits,
//             poolUnits,
//             poolCoins,
//             k,
//             x0: initialPoolUnits,
//         }
//         return makerState
//     }
//     private processAMMOrderImpl(signedTakerOrderSize: number): TMakerResult | null {
//         const makerParams = this.params as TKMakerParams
//         if (!makerParams) {
//             return null
//         }
//         const { propsUpdate } = this.computePropsUpdate(makerParams, signedTakerOrderSize)
//         const stateUpdate = {
//             ['params.poolCoins']: FieldValue.increment(propsUpdate.poolCoinDelta),
//             ['params.poolUnits']: FieldValue.increment(propsUpdate.poolUnitDelta),
//             ['params.k']: FieldValue.increment(propsUpdate.kDelta),
//             ['madeUnits']: FieldValue.increment(propsUpdate.madeUnitsDelta),
//             ['currentPrice']: propsUpdate.currentPrice,
//         }
//         return {
//             makerDeltaUnits: propsUpdate.poolUnitDelta,
//             makerDeltaValue: propsUpdate.poolCoinDelta,
//             stateUpdate: stateUpdate,
//         }
//     }
//     private computePropsUpdate(marketMaker: TKMakerParams, orderSize: number) {
//         const initialPoolUnits = marketMaker.poolUnits
//         const initialPoolCoins = marketMaker.poolCoins
//         const k = marketMaker.k
//         let makerPoolUnitDelta = orderSize
//         if (makerPoolUnitDelta < 0) {
//             const makerSizeRemaining = (initialPoolUnits - 1) * -1 // NOTE: Can't take last unit
//             makerPoolUnitDelta = Math.max(orderSize, makerSizeRemaining)
//         }
//         const newMakerPoolUnits = round4(initialPoolUnits - makerPoolUnitDelta)
//         const newMakerPoolCoins = round4(k / newMakerPoolUnits) // maintain constant
//         const makerPoolCoinDelta = round4(newMakerPoolCoins - initialPoolCoins)
//         const lastPrice = round4(newMakerPoolCoins / newMakerPoolUnits)
//         return {
//             propsUpdate: {
//                 poolUnitDelta: makerPoolUnitDelta * -1,
//                 poolCoinDelta: makerPoolCoinDelta,
//                 kDelta: 0,
//                 madeUnitsDelta: makerPoolUnitDelta,
//                 currentPrice: lastPrice,
//             },
//         }
//     }
// }
