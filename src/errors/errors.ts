// tslint:disable:max-classes-per-file

export class HttpError extends Error {
    status: number
    title: string
    additionalData: any

    constructor(status: number, title: string, message: string, additionalData: any = {}) {
        super(message)
        this.status = status
        this.title = title
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

export class ConflictError extends HttpError {
    constructor(message: string, additionalData: any = {}) {
        super(409, 'Conflict Error', message, additionalData)
    }
}

export class InsufficientBalance extends HttpError {
    constructor(message: string, additionalData: any = {}) {
        super(409, 'Conflict Error', message, additionalData)
    }
}
