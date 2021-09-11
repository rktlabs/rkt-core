// tslint:disable:max-classes-per-file

export class HttpError extends Error {
    status: number
    title: string
    // retryable: boolean
    additionalData: any

    constructor(status: number, title: string, message: string, additionalData: any = {}) {
        super(message)
        this.status = status
        this.title = title
        // this.retryable = false
        this.additionalData = additionalData
    }

    get name() {
        return this.constructor.name
    }

    get statusCode() {
        return this.status
    }

    get statusTitle() {
        return this.title
    }

    get detail() {
        return this.toString()
    }

    // get isRetryable() {
    //     return this.retryable
    // }
}

export class ServerError extends HttpError {
    constructor(message: string, additionalData: any = {}) {
        super(500, 'Server Error', message, additionalData)
    }
}

export class NotFoundError extends HttpError {
    constructor(message: string, additionalData: any = {}) {
        super(404, 'Not Found Error', message, additionalData)
    }
}

export class ClientError extends HttpError {
    constructor(message: string, additionalData: any = {}) {
        super(400, 'Client Error', message, additionalData)
    }
}

export class DuplicateError extends HttpError {
    constructor(message: string, additionalData: any = {}) {
        super(409, 'Conflict Error', message, additionalData)
    }
}

// export class ArgumentError extends HttpError {
//     constructor(message: string, additionalData: any = {}) {
//         super(400, 'Client Error', message, additionalData)
//     }
// }

export class UnprocessableError extends HttpError {
    constructor(message: string, additionalData: any = {}) {
        super(422, 'Unprocessable Error', message, additionalData)
    }
}

export class ValidationError extends ClientError {
    constructor(jsonValidationError: any, additionalData: any = {}) {
        super(jsonValidationError.toString(), additionalData)
    }
}

export class InvalidTransaction extends UnprocessableError {
    constructor(message: string, additionalData: any = {}) {
        super(message, additionalData)
    }
}

// export class CancelOrderFailure extends UnprocessableError {
//     constructor(message: string) {
//         super(message)
//     }
// }

// export class Expired extends UnprocessableError {
//     constructor(message: string, additionalData: any = {}) {
//         super(message, additionalData)
//     }
// }

export class TypeError extends ServerError {
    constructor(message: string, additionalData: any = {}) {
        super(message, additionalData)
    }
}

export class NameError extends ServerError {
    constructor(message: string, additionalData: any = {}) {
        super(message, additionalData)
    }
}

// /////////////////////////////////////////
// // Retryable Errors
// /////////////////////////////////////////

// // export class RetryableNotReady extends HttpError {
// //     constructor(message: string, additionalData: any = {}) {
// //         super(422, 'Unprocessable Error', message, additionalData)
// //         this.retryable = false
// //     }
// // }

// export class NotReady extends HttpError {
//     constructor(message: string, additionalData: any = {}) {
//         super(422, 'Unprocessable Error', message, additionalData)
//     }
// }

// // export class RetryableConflictError extends HttpError {
// //     constructor(message: string, additionalData: any = {}) {
// //         super(409, 'Conflict Error', message, additionalData)
// //         this.retryable = false
// //     }
// // }

export class ConflictError extends HttpError {
    constructor(message: string, additionalData: any = {}) {
        super(409, 'Conflict Error', message, additionalData)
    }
}

// // export class RetryableInsufficientBalance extends HttpError {
// //     constructor(message: string, additionalData: any = {}) {
// //         super(409, 'Conflict Error', message, additionalData)
// //         this.retryable = false
// //     }
// // }

export class InsufficientBalance extends HttpError {
    constructor(message: string, additionalData: any = {}) {
        super(409, 'Conflict Error', message, additionalData)
    }
}
