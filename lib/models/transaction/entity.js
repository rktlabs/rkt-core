'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
const luxon_1 = require("luxon");
const idGenerator_1 = require("../../util/idGenerator");
const errors_1 = require("../../errors");
const validator_1 = require("./validator");
const transferValidator_1 = require("./transferValidator");
class Transaction {
    constructor(props) {
        this.transactionId = props.transactionId;
        this.createdAt = props.createdAt;
        this.transactionStatus = props.transactionStatus;
        this.inputs = props.inputs;
        this.outputs = props.outputs;
        this.tags = props.tags;
        this.xids = props.xids;
    }
    // Member Properties for new model
    static newTransaction(props) {
        const transactionId = `TRX::${(0, idGenerator_1.generateId)()}`;
        const createdAt = luxon_1.DateTime.utc().toString();
        const newTransactionProps = {
            transactionId,
            createdAt,
            transactionStatus: 'new',
            inputs: props.inputs,
            outputs: props.outputs,
        };
        if (props.tags) {
            newTransactionProps.tags = Object.assign({}, props.tags);
        }
        if (props.xids) {
            newTransactionProps.xids = Object.assign({}, props.xids);
        }
        const newEntity = new Transaction(newTransactionProps);
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
    static validateTransfer(jsonPayload) {
        try {
            return (0, transferValidator_1.validateTransfer)(jsonPayload);
        }
        catch (error) {
            throw new errors_1.ValidationError(error);
        }
    }
}
exports.Transaction = Transaction;
