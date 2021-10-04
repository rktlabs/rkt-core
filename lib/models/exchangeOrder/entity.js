'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExchangeOrder = void 0;
const luxon_1 = require("luxon");
const errors_1 = require("../../errors");
const validator_1 = require("./validator");
const __1 = require("../..");
class ExchangeOrder {
    constructor(props) {
        // this.operation = props.operation
        this.orderId = props.orderId;
        this.portfolioId = props.orderInput.portfolioId;
        this.orderInput = props.orderInput;
        this.createdAt = props.createdAt;
        this.orderStatus = props.orderStatus;
        this.orderState = props.orderState;
        this.sizeRemaining = props.sizeRemaining;
        this.reason = props.reason;
        this.filledPrice = props.filledPrice;
        this.filledSize = props.filledSize;
        this.filledValue = props.filledValue;
        this.closedAt = props.closedAt;
        this.events = props.events;
        this.executedAt = props.executedAt;
    }
    // Member Properties for new model
    static newExchangeOrder(orderInput) {
        const orderId = orderInput.sourceOrderId;
        const createdAt = luxon_1.DateTime.utc().toString();
        const exchangeOrderProps = {
            orderId: orderId || `ORDER::${(0, __1.generateId)()}`,
            createdAt: createdAt,
            orderStatus: 'received',
            orderState: 'open',
            sizeRemaining: orderInput.orderSize,
            orderInput: orderInput,
            // operation: props.operation || 'order',
            portfolioId: orderInput.portfolioId,
            events: [],
        };
        const newEntity = new ExchangeOrder(exchangeOrderProps);
        return newEntity;
    }
    static validate(jsonPayload) {
        try {
            return (0, validator_1.exchangeOrderValidator)(jsonPayload);
        }
        catch (error) {
            // ValdationError
            throw new errors_1.ValidationError(error);
        }
    }
}
exports.ExchangeOrder = ExchangeOrder;
