"use strict";
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
exports.MakerBase = void 0;
const __1 = require("../../..");
const __2 = require("../../../..");
const serializer_1 = require("./serializer");
// Maker holds value and shares to be sold.
class MakerBase {
    constructor(props) {
        ////////////////////////////////////////////////////
        //  onUpdateQuote
        //  - store new quoted for the asset indicated
        ////////////////////////////////////////////////////
        this.onUpdateQuote = (trade, bid, ask) => __awaiter(this, void 0, void 0, function* () {
            const assetId = trade.assetId;
            const last = trade.taker.filledPrice;
            const updateProps = { bid, ask, last };
            yield this.assetRepository.updateAsync(assetId, updateProps);
        });
        this.createdAt = props.createdAt;
        this.type = props.type;
        this.assetId = props.assetId;
        this.ownerId = props.ownerId;
        this.portfolioId = props.portfolioId;
        this.currentPrice = props.currentPrice;
        this.params = props.params;
        this.assetRepository = new __2.AssetRepository();
        this.makerRepository = new __2.MakerRepository();
        this.portfolioRepository = new __2.PortfolioRepository();
    }
    flattenMaker() {
        const tMaker = {
            createdAt: this.createdAt,
            type: this.type,
            assetId: this.assetId,
            ownerId: this.ownerId,
            currentPrice: this.currentPrice,
            params: this.params,
        };
        if (this.portfolioId) {
            tMaker.portfolioId = this.portfolioId;
        }
        return tMaker;
    }
    static serialize(selfUrl, baseUrl, data) {
        return (0, serializer_1.serialize)(selfUrl, baseUrl, data);
    }
    static serializeCollection(selfUrl, baseUrl, qs, data) {
        return (0, serializer_1.serializeCollection)(selfUrl, baseUrl, qs, data);
    }
    resolveAssetSpec(assetSpec) {
        return __awaiter(this, void 0, void 0, function* () {
            const asset = typeof assetSpec === 'string' ? yield this.assetRepository.getDetailAsync(assetSpec) : assetSpec;
            if (!asset) {
                throw new Error(`Asset Not Found: ${assetSpec}`);
            }
            return asset;
        });
    }
    processTakerOrder(order) {
        return __awaiter(this, void 0, void 0, function* () {
            const assetId = order.assetId;
            const orderSide = order.orderSide;
            const orderSize = order.orderSize;
            const trade = new __1.MakerTrade(order);
            ////////////////////////////
            // verify that asset exists
            ////////////////////////////
            const asset = yield this.assetRepository.getDetailAsync(assetId);
            if (!asset) {
                const msg = `Invalid Order: Asset: ${assetId} does not exist`;
                throw new __2.NotFoundError(msg, { assetId });
            }
            ////////////////////////////////////////////////////////
            // Process the order
            ////////////////////////////////////////////////////////
            // TODO: There is an assumption that the maker portfolio is the asset. That would,
            // actually, be up to the maker, yes?
            const assetPortfolioId = asset.portfolioId;
            if (!assetPortfolioId) {
                const msg = `Invalid Order: Asset Portfolio: not configured`;
                throw new __2.NotFoundError(msg);
            }
            const tradeStats = yield this.processOrderImpl(orderSide, orderSize);
            if (tradeStats) {
                let { makerDeltaUnits, makerDeltaCoins } = tradeStats;
                const makerFill = new __1.MakerFill({
                    assetId: assetId,
                    portfolioId: assetPortfolioId,
                    orderSide: orderSide === 'bid' ? 'ask' : 'bid',
                    orderSize: orderSize,
                });
                trade.fillMaker(makerFill, makerDeltaUnits, makerDeltaCoins);
                return trade;
            }
            else {
                return null;
            }
        });
    }
}
exports.MakerBase = MakerBase;
