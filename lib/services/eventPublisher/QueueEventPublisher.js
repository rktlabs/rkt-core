'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueEventPublisher = void 0;
const queuePublisher_1 = require("./publishers/queuePublisher");
const EventPublisherBase_1 = require("./EventPublisherBase");
class QueueEventPublisher extends EventPublisherBase_1.EventPublisherBase {
    constructor() {
        const publisher = new queuePublisher_1.QueuePublisher();
        super(publisher);
    }
}
exports.QueueEventPublisher = QueueEventPublisher;
