"use strict";
// tslint:disable:no-unused-expression
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
exports.handleEventError = exports.handleApiError = void 0;
const errors_1 = require("./errors");
const handleApiError = (error, req, res, logger) => __awaiter(void 0, void 0, void 0, function* () {
    const selfUrl = req.fantUrls.selfUrl;
    const appBase = req.fantUrls.appBase;
    let errorResponse;
    if (error instanceof errors_1.HttpError) {
        errorResponse = {
            errors: [
                {
                    status: error.statusCode,
                    title: error.statusTitle,
                    detail: error.detail,
                    source: { url: selfUrl },
                    additionalData: error.additionalData,
                },
            ],
        };
    }
    else {
        errorResponse = {
            errors: [
                {
                    status: 500,
                    title: 'Server Error',
                    detail: error.message,
                    source: { url: selfUrl },
                    additionalData: error.additionalData,
                    stack: error.stack,
                },
            ],
        };
    }
    const statusCode = error.statusCode || 500;
    // if (error.isRetryable) {
    //     // await publishWarningEventAsync(errorResponse, {
    //     //   source: appBase,
    //     //   url: selfUrl,
    //     // });
    //     logger && logger.warn(`Retryable Error: ${JSON.stringify(errorResponse)}`)
    // } else {
    // await publishErrorEventAsync(
    //   errorResponse,
    //   { source: appBase, url: selfUrl },
    //   logger
    // );
    logger && logger.error(`Error: ${JSON.stringify(errorResponse)}`);
    // }
    res.status(statusCode).send(errorResponse);
});
exports.handleApiError = handleApiError;
const handleEventError = (error, req, res, logger) => __awaiter(void 0, void 0, void 0, function* () {
    const selfUrl = req.fantUrls.selfUrl;
    const appBase = req.fantUrls.appBase;
    let errorResponse;
    if (error instanceof errors_1.HttpError) {
        errorResponse = {
            errors: [
                {
                    status: error.statusCode,
                    title: error.statusTitle,
                    detail: error.detail,
                    source: { url: selfUrl },
                    additionalData: error.additionalData,
                },
            ],
        };
    }
    else {
        errorResponse = {
            errors: [
                {
                    status: 500,
                    title: 'Server Error',
                    detail: error.message,
                    source: { url: selfUrl },
                    additionalData: error.additionalData,
                    stack: error.stack,
                },
            ],
            payload: error.payload,
        };
    }
    // default to "no retry" return code
    let statusCode = 202;
    // if (error.isRetryable) {
    //     if (error.payload && error.payload.publishedAt) {
    //         const publishedAt = error.payload.publishedAt
    //         const expiresAt = publishedAt.add(5, 'minute')
    //         if (expiresAt < DateTime.utc()) {
    //             // if expires, then set code such that won't be retried
    //             // await publishErrorEventAsync(
    //             //   errorResponse,
    //             //   { source: appBase, url: selfUrl, note: "expired" },
    //             //   logger
    //             // );
    //             logger && logger.error(`Error: ${JSON.stringify(errorResponse)}`)
    //         } else {
    //             // will be retried - set status code to actual error code - will trigger retry
    //             // await publishWarningEventAsync(
    //             //   errorResponse,
    //             //   { source: appBase, url: selfUrl, note: "warning" },
    //             //   logger
    //             // );
    //             logger && logger.warn(`Retryable Error: ${JSON.stringify(errorResponse)}`)
    //             statusCode = error.statusCode
    //         }
    //     } else {
    //         // no published-at timestamp so can't expire so don't retry. need publishedAt ts to retru
    //         // await publishErrorEventAsync(
    //         //   errorResponse,
    //         //   { source: appBase, url: selfUrl, note: "no published at" },
    //         //   logger
    //         // );
    //         logger && logger.error(`Error: ${JSON.stringify(errorResponse)}`)
    //     }
    // } else {
    // 200 level code means won't be retried.
    // await publishErrorEventAsync(
    //   errorResponse,
    //   { source: appBase, url: selfUrl, note: "not retryable" },
    //   logger
    // );
    logger && logger.error(`Error: ${JSON.stringify(errorResponse)}`);
    // }
    res.status(statusCode).send(errorResponse);
});
exports.handleEventError = handleEventError;
