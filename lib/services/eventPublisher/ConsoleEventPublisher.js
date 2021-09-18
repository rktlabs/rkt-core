'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleEventPublisher = void 0;
const EventPublisherBase_1 = require("./EventPublisherBase");
const _1 = require(".");
class ConsoleEventPublisher extends EventPublisherBase_1.EventPublisherBase {
    constructor() {
        const publisher = new _1.ConsolePublisher();
        super(publisher);
    }
}
exports.ConsoleEventPublisher = ConsoleEventPublisher;
