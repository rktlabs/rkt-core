'use strict'

import * as log4js from 'log4js'
import { DateTime } from 'luxon'

import { BondingCurveAMM, BondingCurveAMMParams } from './bondingCurveAMM'
import { TNewMarketMakerConfig, TMarketMaker, TMarketMakerQuote } from '../..'
import { AssetRepository, PortfolioRepository, TransactionRepository, MarketMakerRepository } from '../../../..'
const logger = log4js.getLogger('portfolioRepository')

export type ConstantBondingCurveAMMSettings = {
    initialUnits?: number
    initialValue?: number
    initialPrice?: number
}

export class ConstantBondingCurveAMM extends BondingCurveAMM {
    static newMaker(
        assetRepository: AssetRepository,
        portfolioRepository: PortfolioRepository,
        transactionRepository: TransactionRepository,
        marketMakerRepository: MarketMakerRepository,
        config: TNewMarketMakerConfig,
    ) {
        const makerProps: TMarketMaker = {
            createdAt: DateTime.utc().toString(),
            type: config.type,
            assetId: config.assetId,
            ownerId: config.ownerId,
            tags: config.tags,
        }

        const newEntity = new ConstantBondingCurveAMM(
            assetRepository,
            portfolioRepository,
            transactionRepository,
            marketMakerRepository,
            makerProps,
        )
        newEntity.params = newEntity.computeInitialState(config.settings)

        /////////////////////////////////////////////////////////
        // compute the quote(s)
        /////////////////////////////////////////////////////////
        // const quote: TMarketMakerQuote = {
        //     current: newEntity.spot_price(),
        //     bid1: newEntity.compute_price(),
        //     ask1: newEntity.compute_value(),
        //     bid10: newEntity.compute_price(10) / 10,
        //     ask10: newEntity.params.madeUnits >= 10 ? newEntity.compute_value(10) / 10 : NaN,
        // }

        return newEntity
    }

    private computeInitialState(settings: ConstantBondingCurveAMMSettings): BondingCurveAMMParams {
        const makerState: BondingCurveAMMParams = {
            madeUnits: settings?.initialUnits || 0,
            cumulativeValue: settings?.initialValue || 0,
            y0: settings?.initialPrice || 1,
            e: 0,
            m: 1,
        }
        return makerState
    }

    constructor(
        assetRepository: AssetRepository,
        portfolioRepository: PortfolioRepository,
        transactionRepository: TransactionRepository,
        marketMakerRepository: MarketMakerRepository,
        props: TMarketMaker,
    ) {
        super(assetRepository, portfolioRepository, transactionRepository, marketMakerRepository, props)
    }
}
