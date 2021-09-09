// // tslint:disable:no-unused-expression

// import { DateTime } from 'luxon'
// import { HttpError } from './errors'

// export const handleApiError = async (error: any, req: any, res: any, logger: any) => {
//     const selfUrl = req.fantUrls.selfUrl
//     const appBase = req.fantUrls.appBase

//     let errorResponse
//     if (error instanceof HttpError) {
//         errorResponse = {
//             errors: [
//                 {
//                     status: error.statusCode,
//                     title: error.statusTitle,
//                     detail: error.detail,
//                     source: { url: selfUrl },
//                     additionalData: error.additionalData,
//                 },
//             ],
//         }
//     } else {
//         errorResponse = {
//             errors: [
//                 {
//                     status: 500,
//                     title: 'Server Error',
//                     detail: error.message,
//                     source: { url: selfUrl },
//                     additionalData: error.additionalData,
//                     stack: error.stack,
//                 },
//             ],
//         }
//     }

//     const statusCode = error.statusCode || 500
//     // if (error.isRetryable) {
//     //     // await publishWarningEventAsync(errorResponse, {
//     //     //   source: appBase,
//     //     //   url: selfUrl,
//     //     // });
//     //     logger && logger.warn(`Retryable Error: ${JSON.stringify(errorResponse)}`)
//     // } else {
//     // await publishErrorEventAsync(
//     //   errorResponse,
//     //   { source: appBase, url: selfUrl },
//     //   logger
//     // );
//     logger && logger.error(`Error: ${JSON.stringify(errorResponse)}`)
//     // }
//     res.status(statusCode).send(errorResponse)
// }

// export const handleEventError = async (error: any, req: any, res: any, logger: any) => {
//     const selfUrl = req.fantUrls.selfUrl
//     const appBase = req.fantUrls.appBase

//     let errorResponse
//     if (error instanceof HttpError) {
//         errorResponse = {
//             errors: [
//                 {
//                     status: error.statusCode,
//                     title: error.statusTitle,
//                     detail: error.detail,
//                     source: { url: selfUrl },
//                     additionalData: error.additionalData,
//                 },
//             ],
//         }
//     } else {
//         errorResponse = {
//             errors: [
//                 {
//                     status: 500,
//                     title: 'Server Error',
//                     detail: error.message,
//                     source: { url: selfUrl },
//                     additionalData: error.additionalData,
//                     stack: error.stack,
//                 },
//             ],
//             payload: error.payload,
//         }
//     }

//     // default to "no retry" return code
//     let statusCode = 202
//     // if (error.isRetryable) {
//     //     if (error.payload && error.payload.publishedAt) {
//     //         const publishedAt = error.payload.publishedAt
//     //         const expiresAt = publishedAt.add(5, 'minute')
//     //         if (expiresAt < DateTime.utc()) {
//     //             // if expires, then set code such that won't be retried
//     //             // await publishErrorEventAsync(
//     //             //   errorResponse,
//     //             //   { source: appBase, url: selfUrl, note: "expired" },
//     //             //   logger
//     //             // );
//     //             logger && logger.error(`Error: ${JSON.stringify(errorResponse)}`)
//     //         } else {
//     //             // will be retried - set status code to actual error code - will trigger retry
//     //             // await publishWarningEventAsync(
//     //             //   errorResponse,
//     //             //   { source: appBase, url: selfUrl, note: "warning" },
//     //             //   logger
//     //             // );
//     //             logger && logger.warn(`Retryable Error: ${JSON.stringify(errorResponse)}`)
//     //             statusCode = error.statusCode
//     //         }
//     //     } else {
//     //         // no published-at timestamp so can't expire so don't retry. need publishedAt ts to retru
//     //         // await publishErrorEventAsync(
//     //         //   errorResponse,
//     //         //   { source: appBase, url: selfUrl, note: "no published at" },
//     //         //   logger
//     //         // );
//     //         logger && logger.error(`Error: ${JSON.stringify(errorResponse)}`)
//     //     }
//     // } else {
//     // 200 level code means won't be retried.
//     // await publishErrorEventAsync(
//     //   errorResponse,
//     //   { source: appBase, url: selfUrl, note: "not retryable" },
//     //   logger
//     // );
//     logger && logger.error(`Error: ${JSON.stringify(errorResponse)}`)
//     // }

//     res.status(statusCode).send(errorResponse)
// }
