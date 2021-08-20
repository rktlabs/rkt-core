"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExchangeOrder = void 0;
const luxon_1 = require("luxon");
const idGenerator_1 = require("../../util/idGenerator");
const errors_1 = require("../../errors");
const exchangeOrderSerializer_1 = require("./exchangeOrderSerializer");
const exchangeOrderValidator_1 = require("./exchangeOrderValidator");
class ExchangeOrder {
    constructor(props) {
        this.operation = props.operation;
        this.orderType = props.orderType;
        this.orderSide = props.orderSide;
        this.assetId = props.assetId;
        this.portfolioId = props.portfolioId;
        this.orderPrice = props.orderPrice;
        this.orderSize = props.orderSize;
        this.tags = props.tags;
        this.refOrderId = props.refOrderId;
        this.createdAt = props.createdAt;
        this.status = props.status;
        this.state = props.state;
        this.orderId = props.orderId;
        this.sizeRemaining = props.sizeRemaining;
        this.error = props.error;
        //this.canceledAt = props.canceledAt
        //this.canceledBy = props.canceledBy
        this.closedAt = props.closedAt;
    }
    // Member Properties for new model
    static newExchangeOrder(props) {
        const orderId = props.orderId || `EXCG::${idGenerator_1.generateId()}`;
        const createdAt = luxon_1.DateTime.utc().toString();
        const exchangeOrderProps = {
            orderId: orderId,
            createdAt: createdAt,
            status: 'new',
            state: 'open',
            sizeRemaining: props.orderSize,
            operation: props.operation || 'order',
            orderType: props.orderType,
            orderSide: props.orderSide,
            assetId: props.assetId,
            portfolioId: props.portfolioId,
            orderPrice: props.orderPrice,
            orderSize: props.orderSize,
            tags: props.tags,
        };
        const newEntity = new ExchangeOrder(exchangeOrderProps);
        return newEntity;
    }
    static serialize(req, data) {
        return exchangeOrderSerializer_1.serialize(req, data);
    }
    static serializeCollection(req, data) {
        return exchangeOrderSerializer_1.serializeCollection(req, data);
    }
    static validate(jsonPayload) {
        try {
            return exchangeOrderValidator_1.exchangeOrderValidator(jsonPayload);
        }
        catch (error) {
            // ValdationError
            throw new errors_1.ValidationError(error);
        }
    }
}
exports.ExchangeOrder = ExchangeOrder;
