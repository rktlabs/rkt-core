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
exports.KMaker = void 0;
const __1 = require("../../../..");
const admin = require("firebase-admin");
const luxon_1 = require("luxon");
const entity_1 = require("../makerBase/entity");
const FieldValue = admin.firestore.FieldValue;
class KMaker extends entity_1.MakerBase {
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
        const newEntity = new KMaker(makerProps);
        newEntity.params = newEntity.computeInitialState(props);
        return newEntity;
    }
    computeInitialState(newMakerConfig) {
        var _a, _b, _c;
        const initMadeUnits = ((_a = newMakerConfig.settings) === null || _a === void 0 ? void 0 : _a.initMadeUnits) || 0;
        const initPrice = ((_b = newMakerConfig.settings) === null || _b === void 0 ? void 0 : _b.initPrice) || 1;
        const initialPoolUnits = ((_c = newMakerConfig.settings) === null || _c === void 0 ? void 0 : _c.initialPoolUnits) || 1000;
        const poolUnits = initialPoolUnits - initMadeUnits;
        const poolCoins = poolUnits * initPrice;
        const k = poolUnits * poolCoins;
        const makerState = {
            madeUnits: initMadeUnits,
            poolUnits,
            poolCoins,
            k,
            x0: initialPoolUnits,
        };
        return makerState;
    }
    computeStateUpdate(stateUpdate) {
        const data = {
            ['params.poolCoins']: FieldValue.increment(stateUpdate.poolCoinDelta),
            ['params.poolUnits']: FieldValue.increment(stateUpdate.poolUnitDelta),
            ['params.k']: FieldValue.increment(stateUpdate.kDelta),
            ['madeUnits']: FieldValue.increment(stateUpdate.madeUnitsDelta),
            ['currentPrice']: stateUpdate.currentPrice,
        };
        return data;
    }
    processTakerOrder(order) {
        return __awaiter(this, void 0, void 0, function* () {
            ///////////////////////////////////////////////////
            // create trade and fill in maker from asset pools
            const trade = new __1.MakerTrade(order);
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
            const taken = this.processOrderUnits(signedTakeSize);
            if (taken) {
                const data = taken.statusUpdate;
                yield this.updateMakerStateAsync(assetId, data);
                const { makerDeltaUnits, makerDeltaCoins } = taken;
                const makerFill = new __1.MakerFill({
                    assetId: taker.assetId,
                    portfolioId: makerPortfolioId,
                    orderSide: taker.orderSide === 'bid' ? 'ask' : 'bid',
                    orderSize: taker.orderSize,
                });
                trade.fillMaker(makerFill, makerDeltaUnits, makerDeltaCoins);
                // if (trade.taker.filledSize !== 0) {
                //     //     // await this.onFill(trade.taker)
                //     //     // await this.onTrade(trade)
                //     await this.onUpdateQuote(trade, bid, ask)
                // }
                return trade;
            }
            else {
                return null;
            }
        });
    }
    processSimpleOrder(assetId, orderSide, orderSize) {
        return __awaiter(this, void 0, void 0, function* () {
            return null;
        });
    }
    updateMakerStateAsync(assetId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.makerRepository.updateMakerStateAsync(assetId, data);
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
        const { 
        // lastPrice: ask,
        propsUpdate, } = this.computePrice(makerParams, takeSize);
        // const { lastPrice: bid } = this.computePrice(makerParams, takeSize - 1)
        const statusUpdate = this.computeStateUpdate(propsUpdate);
        return {
            // bid: bid,
            // ask: ask,
            // last: bid,
            makerDeltaUnits: propsUpdate.poolUnitDelta,
            makerDeltaCoins: propsUpdate.poolCoinDelta,
            statusUpdate: statusUpdate,
        };
    }
    computePrice(maker, orderSize) {
        const initialPoolUnits = maker.poolUnits;
        const initialPoolCoins = maker.poolCoins;
        const k = maker.k;
        let makerPoolUnitDelta = orderSize;
        if (makerPoolUnitDelta < 0) {
            const makerSizeRemaining = (initialPoolUnits - 1) * -1; // NOTE: Can't take last unit
            makerPoolUnitDelta = Math.max(orderSize, makerSizeRemaining);
        }
        const newMakerPoolUnits = (0, __1.round4)(initialPoolUnits - makerPoolUnitDelta);
        const newMakerPoolCoins = (0, __1.round4)(k / newMakerPoolUnits); // maintain constant
        const makerPoolCoinDelta = (0, __1.round4)(newMakerPoolCoins - initialPoolCoins);
        const lastPrice = (0, __1.round4)(newMakerPoolCoins / newMakerPoolUnits);
        return {
            // lastPrice: lastPrice,
            propsUpdate: {
                poolUnitDelta: makerPoolUnitDelta * -1,
                poolCoinDelta: makerPoolCoinDelta,
                kDelta: 0,
                madeUnitsDelta: makerPoolUnitDelta,
                currentPrice: lastPrice,
            },
        };
    }
}
exports.KMaker = KMaker;
