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
exports.MarketMakerBase = void 0;
const __1 = require("../..");
const __2 = require("../../..");
const serializer_1 = require("./serializer");
// MarketMaker holds value and shares to be sold.
class MarketMakerBase {
    // currentPrice?: number
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
        this.tags = props.tags;
        this.params = props.params;
        // this.currentPrice = props.currentPrice
        this.assetRepository = new __2.AssetRepository();
        this.marketMakerRepository = new __2.MarketMakerRepository();
        this.portfolioRepository = new __2.PortfolioRepository();
    }
    flattenMaker() {
        const makerData = {
            createdAt: this.createdAt,
            type: this.type,
            assetId: this.assetId,
            ownerId: this.ownerId,
            tags: this.tags,
            params: this.params,
            // currentPrice: this.currentPrice,
        };
        if (this.portfolioId) {
            makerData.portfolioId = this.portfolioId;
        }
        return makerData;
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
    static serialize(selfUrl, baseUrl, data) {
        return (0, serializer_1.serialize)(selfUrl, baseUrl, data);
    }
    static serializeCollection(selfUrl, baseUrl, qs, data) {
        return (0, serializer_1.serializeCollection)(selfUrl, baseUrl, qs, data);
    }
    processOrder(order) {
        return __awaiter(this, void 0, void 0, function* () {
            const assetId = order.assetId;
            const orderSide = order.orderSide;
            const orderSize = order.orderSize;
            ////////////////////////////
            // verify that asset exists
            ////////////////////////////
            const asset = yield this.assetRepository.getDetailAsync(assetId);
            if (!asset) {
                const msg = `Invalid Order: Asset: ${assetId} does not exist`;
                throw new __2.NotFoundError(msg, { assetId });
            }
            // for this maker, the asset portfolio holds the unit stock.
            const assetPortfolioId = asset.portfolioId;
            if (!assetPortfolioId) {
                const msg = `Invalid Order: Asset Portfolio: not configured for ${assetId}`;
                throw new __2.NotFoundError(msg);
            }
            ////////////////////////////////////////////////////////
            // Process the order
            ////////////////////////////////////////////////////////
            const processMakerTrade = yield this.processOrderImpl(orderSide, orderSize);
            if (processMakerTrade) {
                let { makerDeltaUnits, makerDeltaValue } = processMakerTrade;
                const trade = new __1.Trade(order);
                trade.supplyMakerSide({
                    assetId: assetId,
                    portfolioId: assetPortfolioId,
                    orderSide: orderSide === 'bid' ? 'ask' : 'bid',
                    orderSize: orderSize,
                    makerDeltaUnits: makerDeltaUnits,
                    makerDeltaValue: makerDeltaValue,
                });
                return trade;
            }
            else {
                return null;
            }
        });
    }
}
exports.MarketMakerBase = MarketMakerBase;
