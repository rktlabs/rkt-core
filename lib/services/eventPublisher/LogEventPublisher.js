'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogEventPublisher = void 0;
const EventPublisherBase_1 = require("./EventPublisherBase");
const _1 = require(".");
class LogEventPublisher extends EventPublisherBase_1.EventPublisherBase {
    constructor(opts) {
        const publisher = new _1.LoggingPublisher(opts);
        super(publisher);
    }
}
exports.LogEventPublisher = LogEventPublisher;
