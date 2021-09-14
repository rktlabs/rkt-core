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
exports.Bonding2Maker = void 0;
const __1 = require("../../../..");
const admin = require("firebase-admin");
const luxon_1 = require("luxon");
const entity_1 = require("../makerBase/entity");
const FieldValue = admin.firestore.FieldValue;
const bondingFunction = (x, params) => {
    const x0 = params.x0;
    return x + x0 + 1;
};
const inverseBondingFunction = (currentPrice, madeUnits) => {
    const params = {
        madeUnits: madeUnits,
        x0: currentPrice - 1 - madeUnits,
    };
    return params;
};
class Bonding2Maker extends entity_1.MakerBase {
    constructor(props) {
        super(props);
        this.portfolioRepository = new __1.PortfolioRepository();
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
        const newEntity = new Bonding2Maker(makerProps);
        newEntity.params = newEntity.computeMakerInitialState(props);
        return newEntity;
    }
    computeMakerInitialState(newMakerConfig) {
        var _a, _b;
        const initMadeUnits = ((_a = newMakerConfig.settings) === null || _a === void 0 ? void 0 : _a.initMadeUnits) || 0;
        const initPrice = ((_b = newMakerConfig.settings) === null || _b === void 0 ? void 0 : _b.initPrice) || 1;
        const makerState = inverseBondingFunction(initPrice, initMadeUnits);
        return makerState;
    }
    computeMakerStateUpdate(stateUpdate) {
        const data = {
            ['params.madeUnits']: FieldValue.increment(stateUpdate.madeUnitsDelta),
            currentPrice: stateUpdate.currentPrice,
        };
        return data;
    }
    processOrder(maker, order) {
        return __awaiter(this, void 0, void 0, function* () {
            ///////////////////////////////////////////////////
            // create trade and fill in maker from asset pools
            const trade = new __1.Trade(order);
            const taker = trade.taker;
            // for bid (a buy) I'm "removing" units from the pool, so flip sign
            const signedTakeSize = trade.taker.orderSide === 'ask' ? taker.orderSize * -1 : taker.orderSize;
            ////////////////////////////
            // verify that asset exists
            ////////////////////////////
            const assetId = order.assetId;
            const asset = yield this.assetRepository.getDetailAsync(assetId);
            if (!asset) {
                const msg = `Invalid Order: Asset: ${assetId} does not exist`;
                throw new __1.NotFoundError(msg, { assetId });
            }
            ////////////////////////////////////////////////////////
            // Process the order
            ////////////////////////////////////////////////////////
            // TODO: There is an assumption that the maker portfolio is the asset. That would,
            // actually, be up to the maker, yes?
            const assetPortfolioId = asset.portfolioId;
            if (assetPortfolioId) {
                const assetPortfolio = yield this.portfolioRepository.getDetailAsync(assetPortfolioId);
                if (!assetPortfolio) {
                    const msg = `Invalid Order: Asset Portfolio: ${assetPortfolioId} does not exist`;
                    throw new __1.NotFoundError(msg, { assetPortfolioId });
                }
            }
            else {
                const msg = `Invalid Order: Asset Portfolio: not configured`;
                throw new __1.NotFoundError(msg);
            }
            const makerPortfolioId = assetPortfolioId;
            const taken = maker.processOrderUnits(signedTakeSize);
            if (taken) {
                const data = taken.statusUpdate;
                yield this.updateMakerStateAsync(assetId, data);
                const { bid, ask, makerDeltaUnits, makerDeltaCoins } = taken;
                const makerFill = new __1.MakerFill({
                    assetId: taker.assetId,
                    portfolioId: makerPortfolioId,
                    orderSide: taker.orderSide === 'bid' ? 'ask' : 'bid',
                    orderSize: taker.orderSize,
                });
                trade.fillMaker(makerFill, makerDeltaUnits, makerDeltaCoins);
                if (trade.taker.filledSize !== 0) {
                    //     // await this.onFill(trade.taker)
                    //     // await this.onTrade(trade)
                    yield this.onUpdateQuote(trade, bid, ask);
                }
                return trade;
            }
            else {
                return null;
            }
        });
    }
    updateMakerStateAsync(assetId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.makerRepository.updateMakerStateAsync(assetId, data);
        });
    }
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
        const bid = bondingFunction(this.params.madeUnits - makerDeltaUnits - 1, makerParams);
        const ask = bondingFunction(this.params.madeUnits - makerDeltaUnits - 0, makerParams);
        const last = bid;
        const propsUpdate = {
            madeUnitsDelta: makerDeltaUnits * -1,
            currentPrice: ask,
        };
        const data = this.computeMakerStateUpdate(propsUpdate);
        return {
            bid: bid,
            ask: ask,
            last: last,
            makerDeltaUnits: makerDeltaUnits,
            makerDeltaCoins: makerDeltaCoins,
            statusUpdate: data,
        };
    }
}
exports.Bonding2Maker = Bonding2Maker;