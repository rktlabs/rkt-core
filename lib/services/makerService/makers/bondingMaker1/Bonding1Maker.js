'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bonding1Maker = void 0;
const __1 = require("../../../..");
const luxon_1 = require("luxon");
const entity_1 = require("../makerBase/entity");
const admin = require("firebase-admin");
const FieldValue = admin.firestore.FieldValue;
const bondingFunction = (x, params) => {
    // return x + 1
    // return 1.05 ** x
    const x0 = params.x0;
    return x + x0 === 0 ? 1 : 1 + Math.pow((x + x0), (1 / 2));
};
const inverseBondingFunction = (currentPrice, madeUnits) => {
    // return y - 1
    // return y ** (1/1.05)
    const params = {
        madeUnits: madeUnits,
        x0: Math.pow((currentPrice - 1), 2) - madeUnits,
    };
    return params;
};
class Bonding1Maker extends entity_1.MakerBase {
    constructor(props) {
        super(props);
        this.assetHolderRepository = new __1.AssetHolderRepository();
        this.mintService = new __1.MintService();
    }
    static newMaker(props) {
        var _a;
        const createdAt = luxon_1.DateTime.utc().toString();
        const type = props.type;
        const assetId = props.assetId;
        const makerProps = {
            createdAt,
            type,
            assetId,
            ownerId: props.ownerId,
            currentPrice: (_a = props.settings) === null || _a === void 0 ? void 0 : _a.initPrice,
        };
        const newEntity = new Bonding1Maker(makerProps);
        newEntity.params = newEntity.computeInitialState(props);
        return newEntity;
    }
    computeInitialState(newMakerConfig) {
        var _a, _b;
        const initMadeUnits = ((_a = newMakerConfig.settings) === null || _a === void 0 ? void 0 : _a.initMadeUnits) || 0;
        const initPrice = ((_b = newMakerConfig.settings) === null || _b === void 0 ? void 0 : _b.initPrice) || 1;
        const makerState = inverseBondingFunction(initPrice, initMadeUnits);
        return makerState;
    }
    computeStateUpdate(stateUpdate) {
        const data = {
            ['params.madeUnits']: FieldValue.increment(stateUpdate.madeUnitsDelta),
            currentPrice: stateUpdate.currentPrice,
        };
        return data;
    }
    processOrderImpl(orderSide, orderSize) {
        return __awaiter(this, void 0, void 0, function* () {
            ////////////////////////////
            // verify that asset exists
            ////////////////////////////
            const asset = yield this.resolveAssetSpec(this.assetId);
            ////////////////////////////////////////////////////////
            // Process the order
            ////////////////////////////////////////////////////////
            // TODO: There is an assumption that the maker portfolio is the asset. That would,
            // actually, be up to the maker, yes?
            const assetPortfolioId = asset.portfolioId;
            if (!assetPortfolioId) {
                const msg = `Invalid Order: Asset Portfolio: not configured`;
                throw new __1.NotFoundError(msg);
            }
            if (orderSide == 'bid' && orderSize > 0) {
                // test that asset has enough units to transact
                const assetPortfolioHoldings = yield this.assetHolderRepository.getDetailAsync(this.assetId, assetPortfolioId);
                const portfolioHoldingUnits = (0, __1.round4)((assetPortfolioHoldings === null || assetPortfolioHoldings === void 0 ? void 0 : assetPortfolioHoldings.units) || 0);
                if (portfolioHoldingUnits < orderSize) {
                    const delta = orderSize - portfolioHoldingUnits;
                    // not enough. mint me sonme
                    yield this.mintService.mintUnits(this.assetId, delta);
                }
            }
            // for bid (a buy) I'm "removing" units from the pool, so flip sign
            const signedOrderSize = orderSide === 'ask' ? orderSize * -1 : orderSize;
            const taken = this.processOrderUnits(signedOrderSize);
            if (taken) {
                const data = taken.statusUpdate;
                yield this.makerRepository.updateMakerStateAsync(this.assetId, data);
                const { makerDeltaUnits, makerDeltaCoins } = taken;
                return { makerDeltaUnits, makerDeltaCoins };
            }
            else {
                return null;
            }
        });
    }
    ////////////////////////////////////////////////////////
    // PRIVATE
    ////////////////////////////////////////////////////////
    processOrderUnits(takeSize) {
        const makerParams = this.params;
        if (!makerParams) {
            return null;
        }
        const madeUnits = this.params.madeUnits;
        let makerDeltaUnits = 0;
        let makerDeltaCoins = 0;
        let coins = 0;
        if (takeSize > 0) {
            // for bid (a buy) so maker units is negative, maker coins is positive
            for (let x = madeUnits; x < madeUnits + takeSize; ++x) {
                coins += bondingFunction(x, makerParams);
            }
            makerDeltaUnits = takeSize * -1;
            makerDeltaCoins = (0, __1.round4)(coins);
        }
        else {
            const limitedTakeSize = Math.max(takeSize, madeUnits * -1);
            // ask (sell) maker units is positive, maker coins is negative
            for (let x = madeUnits - 1; x >= madeUnits + limitedTakeSize; --x) {
                coins += bondingFunction(x, makerParams);
            }
            makerDeltaUnits = limitedTakeSize * -1;
            makerDeltaCoins = (0, __1.round4)(coins) * -1;
        }
        // last price adjusted based on taker quantity
        const ask = bondingFunction(this.params.madeUnits - makerDeltaUnits - 0, makerParams);
        const propsUpdate = {
            madeUnitsDelta: makerDeltaUnits * -1,
            currentPrice: ask,
        };
        const statusUpdate = this.computeStateUpdate(propsUpdate);
        return {
            makerDeltaUnits: makerDeltaUnits,
            makerDeltaCoins: makerDeltaCoins,
            statusUpdate: statusUpdate,
        };
    }
}
exports.Bonding1Maker = Bonding1Maker;
