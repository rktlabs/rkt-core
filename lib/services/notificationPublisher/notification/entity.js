'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExchangeOrderCancel = exports.ExchangeOrderNew = exports.TransactionComplete = exports.TransactionError = exports.OrderFill = exports.OrderComplete = exports.OrderFailed = exports.WarningNotification = exports.ErrorNotification = exports.Notification = void 0;
const luxon_1 = require("luxon");
const __1 = require("../../..");
class Notification {
    constructor(notificationType, source, topic, attributes = {}) {
        this.notificationType = notificationType;
        this.publishedAt = luxon_1.DateTime.utc().toString();
        this.nonce = (0, __1.generateNonce)();
        this.source = source;
        this.topic = topic;
        this.attributes = {};
        for (const [key, value] of Object.entries(attributes)) {
            this.attributes[key] = value;
        }
    }
    get type() {
        return this.notificationType;
    }
}
exports.Notification = Notification;
class ErrorNotification extends Notification {
    constructor(source, topic, attributes = {}) {
        super('Error', source, topic, attributes);
    }
}
exports.ErrorNotification = ErrorNotification;
class WarningNotification extends Notification {
    constructor(source, topic, attributes = {}) {
        super('Warning', source, topic, attributes);
    }
}
exports.WarningNotification = WarningNotification;
class OrderFailed extends Notification {
    constructor(source, topic, attributes = {}) {
        super('OrderFailed', source, topic, attributes);
    }
}
exports.OrderFailed = OrderFailed;
class OrderComplete extends Notification {
    constructor(source, topic, attributes = {}) {
        super('OrderComplete', source, topic, attributes);
    }
}
exports.OrderComplete = OrderComplete;
class OrderFill extends Notification {
    constructor(source, topic, attributes = {}) {
        super('OrderFill', source, topic, attributes);
    }
}
exports.OrderFill = OrderFill;
class TransactionError extends Notification {
    constructor(source, topic, attributes = {}) {
        super('TransactionError', source, topic, attributes);
    }
}
exports.TransactionError = TransactionError;
class TransactionComplete extends Notification {
    constructor(source, topic, attributes = {}) {
        super('TransactionComplete', source, topic, attributes);
    }
}
exports.TransactionComplete = TransactionComplete;
class ExchangeOrderNew extends Notification {
    constructor(source, topic, attributes = {}) {
        super('ExchangeOrderNew', source, topic, attributes);
    }
}
exports.ExchangeOrderNew = ExchangeOrderNew;
class ExchangeOrderCancel extends Notification {
    constructor(source, topic, attributes = {}) {
        super('ExchangeOrderCancel', source, topic, attributes);
    }
}
exports.ExchangeOrderCancel = ExchangeOrderCancel;
