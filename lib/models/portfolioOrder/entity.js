'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortfolioOrder = void 0;
const luxon_1 = require("luxon");
const idGenerator_1 = require("../../util/idGenerator");
const errors_1 = require("../../errors");
const serializer_1 = require("./serializer");
const validator_1 = require("./validator");
class PortfolioOrder {
    constructor(props) {
        this.createdAt = props.createdAt;
        this.orderId = props.orderId;
        this.assetId = props.assetId;
        this.closedAt = props.closedAt;
        this.filledPrice = props.filledPrice;
        this.filledSize = props.filledSize;
        this.filledValue = props.filledValue;
        this.sizeRemaining = props.sizeRemaining;
        //this.portfolioId = props.portfolioId
        this.orderSide = props.orderSide;
        this.orderSize = props.orderSize;
        this.status = props.status;
        this.state = props.state;
        this.orderType = props.orderType;
        this.orderPrice = props.orderPrice;
        this.events = props.events;
        this.tags = props.tags;
        this.xids = props.xids;
        this.reason = props.reason;
    }
    static newOrder(props) {
        //const orderId: string = props.orderId || `ORDER::${generateId()}`
        const orderId = `ORDER::${(0, idGenerator_1.generateId)()}`;
        const createdAt = luxon_1.DateTime.utc().toString();
        // only use fields we want. ignore others.
        // const orderEvent: TNewPortfolioOrderEvent = {
        //     eventType: 'Created',
        //     publishedAt: createdAt,
        //     messageId: orderId,
        //     nonce: generateNonce(),
        // }
        const newOrderProps = {
            orderId: orderId,
            createdAt: createdAt,
            orderType: props.orderType || 'market',
            assetId: props.assetId,
            //portfolioId: props.portfolioId, // required
            orderSide: props.orderSide,
            orderSize: props.orderSize,
            status: 'received',
            state: 'open',
            events: [],
        };
        // limit order requires orderPrice
        if (props.orderPrice) {
            newOrderProps.orderPrice = props.orderPrice;
        }
        if (props.xids) {
            newOrderProps.xids = props.xids;
        }
        if (props.tags) {
            newOrderProps.tags = props.tags;
        }
        const newEntity = new PortfolioOrder(newOrderProps);
        return newEntity;
    }
    static validate(jsonPayload) {
        try {
            return (0, validator_1.validate)(jsonPayload);
        }
        catch (error) {
            throw new errors_1.ValidationError(error);
        }
    }
    static serialize(selfUrl, portfolioId, baseUrl, data) {
        return (0, serializer_1.serialize)(selfUrl, portfolioId, baseUrl, data);
    }
    static serializeCollection(selfUrl, portfolioId, baseUrl, qs, data) {
        return (0, serializer_1.serializeCollection)(selfUrl, portfolioId, baseUrl, qs, data);
    }
}
exports.PortfolioOrder = PortfolioOrder;
