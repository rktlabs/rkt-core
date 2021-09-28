'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinearBondingCurveAMM = void 0;
const luxon_1 = require("luxon");
const bondingCurveAMM_1 = require("./bondingCurveAMM");
class LinearBondingCurveAMM extends bondingCurveAMM_1.BondingCurveAMM {
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
        const newEntity = new LinearBondingCurveAMM(assetRepository, portfolioRepository, transactionRepository, marketMakerRepository, makerProps);
        /////////////////////////////////////////////////////////
        // set initial state (params) after contstructed
        /////////////////////////////////////////////////////////
        newEntity.params = newEntity.computeInitialState(config.settings);
        /////////////////////////////////////////////////////////
        // compute the quote(s)
        /////////////////////////////////////////////////////////
        newEntity.quote = newEntity.getQuote();
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
            e: 1,
            m: 1,
        };
        return makerState;
    }
}
exports.LinearBondingCurveAMM = LinearBondingCurveAMM;
