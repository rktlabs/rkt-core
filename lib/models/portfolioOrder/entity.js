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
        this.orderId = props.orderId;
        this.orderSource = props.orderSource;
        this.createdAt = props.createdAt;
        this.closedAt = props.closedAt;
        this.executedAt = props.executedAt;
        this.filledPrice = props.filledPrice;
        this.filledSize = props.filledSize;
        this.filledValue = props.filledValue;
        this.sizeRemaining = props.sizeRemaining;
        this.orderStatus = props.orderStatus;
        this.orderState = props.orderState;
        this.events = props.events;
        this.reason = props.reason;
    }
    static newOrder(orderSource) {
        const createdAt = luxon_1.DateTime.utc().toString();
        const orderId = `ORDER::${(0, idGenerator_1.generateId)()}`;
        orderSource.sourceOrderId = orderId;
        const newOrderProps = {
            orderSource: orderSource,
            orderId: orderId,
            createdAt: createdAt,
            orderStatus: 'received',
            orderState: 'open',
            events: [],
        };
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
