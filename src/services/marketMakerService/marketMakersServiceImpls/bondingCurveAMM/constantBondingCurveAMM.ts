'use strict'

// import * as log4js from 'log4js'
import { DateTime } from 'luxon'
import {
    AssetRepository,
    PortfolioRepository,
    TransactionRepository,
    MarketMakerRepository,
    TMarketMaker,
    TNewMarketMakerConfig,
} from '../../../..'
import { BondingCurveAMM, BondingCurveAMMSettings, BondingCurveAMMParams } from './bondingCurveAMM'

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

        /////////////////////////////////////////////////////////
        // create specific object type
        /////////////////////////////////////////////////////////
        const newEntity = new ConstantBondingCurveAMM(
            assetRepository,
            portfolioRepository,
            transactionRepository,
            marketMakerRepository,
            makerProps,
        )

        /////////////////////////////////////////////////////////
        // set initial state (params) after contstructed
        /////////////////////////////////////////////////////////
        newEntity.marketMaker.params = newEntity.computeInitialState(config.settings)

        /////////////////////////////////////////////////////////
        // compute the quote(s)
        /////////////////////////////////////////////////////////
        newEntity.marketMaker.quote = newEntity.getQuote()

        // NOTE: Can't emit quote here. the handlers won't have been attached yet. have to do it
        // after this function returns and handlers are set

        return newEntity
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

    private computeInitialState(settings: BondingCurveAMMSettings): BondingCurveAMMParams {
        const makerState: BondingCurveAMMParams = {
            madeUnits: settings?.initialUnits || 0,
            cumulativeValue: settings?.initialValue || 0,
            y0: settings?.initialPrice || 1,
            e: 0,
            m: 1,
        }
        return makerState
    }
}
