'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConstantBondingCurveAMM = void 0;
// import * as log4js from 'log4js'
const luxon_1 = require("luxon");
const bondingCurveAMM_1 = require("./bondingCurveAMM");
class ConstantBondingCurveAMM extends bondingCurveAMM_1.BondingCurveAMM {
    static newMaker(assetRepository, portfolioRepository, transactionRepository, marketMakerRepository, config) {
        const makerProps = {
            createdAt: luxon_1.DateTime.utc().toString(),
            type: config.type,
            assetId: config.assetId,
            ownerId: config.ownerId,
            tags: config.tags,
        };
        /////////////////////////////////////////////////////////
        // create specific object type
        /////////////////////////////////////////////////////////
        const newEntity = new ConstantBondingCurveAMM(assetRepository, portfolioRepository, transactionRepository, marketMakerRepository, makerProps);
        /////////////////////////////////////////////////////////
        // set initial state (params) after contstructed
        /////////////////////////////////////////////////////////
        newEntity.marketMaker.params = newEntity.computeInitialState(config.settings);
        /////////////////////////////////////////////////////////
        // compute the quote(s)
        /////////////////////////////////////////////////////////
        newEntity.marketMaker.quote = newEntity.getQuote();
        // NOTE: Can't emit quote here. the handlers won't have been attached yet. have to do it
        // after this function returns and handlers are set
        return newEntity;
    }
    constructor(assetRepository, portfolioRepository, transactionRepository, marketMakerRepository, props) {
        super(assetRepository, portfolioRepository, transactionRepository, marketMakerRepository, props);
    }
    computeInitialState(settings) {
        const makerState = {
            madeUnits: (settings === null || settings === void 0 ? void 0 : settings.initialUnits) || 0,
            cumulativeValue: (settings === null || settings === void 0 ? void 0 : settings.initialValue) || 0,
            y0: (settings === null || settings === void 0 ? void 0 : settings.initialPrice) || 1,
            e: 0,
            m: 1,
        };
        return makerState;
    }
}
exports.ConstantBondingCurveAMM = ConstantBondingCurveAMM;
