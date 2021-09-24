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
const log4js = require("log4js");
const logger = log4js.getLogger();
// MarketMaker holds value and shares to be sold.
class MarketMakerBase {
    // currentPrice?: number
    constructor(assetRepository, portfolioRepository, props) {
        this.createdAt = props.createdAt;
        this.type = props.type;
        this.assetId = props.assetId;
        this.ownerId = props.ownerId;
        this.portfolioId = props.portfolioId;
        this.tags = props.tags;
        this.params = props.params;
        this.quote = props.quote;
        // this.currentPrice = props.currentPrice
        this.assetRepository = assetRepository;
        this.marketMakerRepository = new __2.MarketMakerRepository();
        this.portfolioRepository = portfolioRepository;
    }
    flattenMaker() {
        const makerData = {
            createdAt: this.createdAt,
            type: this.type,
            assetId: this.assetId,
            ownerId: this.ownerId,
            tags: this.tags,
            params: this.params,
            quote: this.quote,
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
                const msg = `Asset Not Found: ${assetSpec}`;
                logger.error(msg);
                throw new Error(msg);
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
            logger.info(`marketMaker processOrder: ${order.orderId} for portfolio: ${order.portfolioId} asset: ${order.assetId}`);
            const assetId = order.assetId;
            const orderSide = order.orderSide;
            const orderSize = order.orderSize;
            ////////////////////////////
            // verify that asset exists
            ////////////////////////////
            const asset = yield this.assetRepository.getDetailAsync(assetId);
            if (!asset) {
                const msg = `Invalid Order: Asset: ${assetId} does not exist`;
                logger.error(msg);
                throw new __2.NotFoundError(msg, { assetId });
            }
            // for this marketMaker, the asset portfolio holds the unit stock.
            const assetPortfolioId = asset.portfolioId;
            if (!assetPortfolioId) {
                const msg = `Invalid Order: Asset Portfolio: not configured for ${assetId}`;
                logger.error(msg);
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
                logger.info(`marketMaker trade: order: ${order.orderId} units: ${makerDeltaUnits} value: ${makerDeltaValue}`);
                return trade;
            }
            else {
                logger.info(`marketMaker processOrder: NO TRADE for order: ${order.orderId}`);
                return null;
            }
        });
    }
}
exports.MarketMakerBase = MarketMakerBase;
