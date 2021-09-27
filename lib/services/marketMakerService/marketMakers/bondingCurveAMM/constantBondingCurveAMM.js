'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConstantBondingCurveAMM = void 0;
const log4js = require("log4js");
const luxon_1 = require("luxon");
const bondingCurveAMM_1 = require("./bondingCurveAMM");
const logger = log4js.getLogger('portfolioRepository');
class ConstantBondingCurveAMM extends bondingCurveAMM_1.BondingCurveAMM {
    static newMaker(assetRepository, portfolioRepository, transactionRepository, marketMakerRepository, config) {
        const makerProps = {
            createdAt: luxon_1.DateTime.utc().toString(),
            type: config.type,
            assetId: config.assetId,
            ownerId: config.ownerId,
            tags: config.tags,
        };
        const newEntity = new ConstantBondingCurveAMM(assetRepository, portfolioRepository, transactionRepository, marketMakerRepository, makerProps);
        newEntity.params = newEntity.computeInitialState(config.settings);
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
        return newEntity;
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
    constructor(assetRepository, portfolioRepository, transactionRepository, marketMakerRepository, props) {
        super(assetRepository, portfolioRepository, transactionRepository, marketMakerRepository, props);
    }
}
exports.ConstantBondingCurveAMM = ConstantBondingCurveAMM;
