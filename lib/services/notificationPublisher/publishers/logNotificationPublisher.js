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
exports.LogNotificationPublisher = void 0;
const notificationPublisherBase_1 = require("./notificationPublisherBase");
const luxon_1 = require("luxon");
class LogNotificationPublisher extends notificationPublisherBase_1.NotificationPublisherBase {
    constructor(opts) {
        super();
        this.logger = opts.logger;
    }
    publishNotification(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const topicName = payload.topic;
            payload.publishedAt = luxon_1.DateTime.utc().toString();
            const dataBuffer = Buffer.from(JSON.stringify(payload));
            this.logger && this.logger.debug(`${topicName}: ${dataBuffer}`);
        });
    }
}
exports.LogNotificationPublisher = LogNotificationPublisher;
