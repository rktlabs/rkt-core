"use strict";
// tslint:disable:max-classes-per-file
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsufficientBalance = exports.ConflictError = exports.NameError = exports.TypeError = exports.InvalidTransaction = exports.ValidationError = exports.UnprocessableError = exports.DuplicateError = exports.ClientError = exports.NotFoundError = exports.ServerError = exports.HttpError = void 0;
class HttpError extends Error {
    constructor(status, title, message, additionalData = {}) {
        super(message);
        this.status = status;
        this.title = title;
        this.additionalData = additionalData;
    }
    get name() {
        return this.constructor.name;
    }
    get statusCode() {
        return this.status;
    }
    get statusTitle() {
        return this.title;
    }
    get detail() {
        return this.toString();
    }
}
exports.HttpError = HttpError;
class ServerError extends HttpError {
    constructor(message, additionalData = {}) {
        super(500, 'Server Error', message, additionalData);
    }
}
exports.ServerError = ServerError;
class NotFoundError extends HttpError {
    constructor(message, additionalData = {}) {
        super(404, 'Not Found Error', message, additionalData);
    }
}
exports.NotFoundError = NotFoundError;
class ClientError extends HttpError {
    constructor(message, additionalData = {}) {
        super(400, 'Client Error', message, additionalData);
    }
}
exports.ClientError = ClientError;
class DuplicateError extends HttpError {
    constructor(message, additionalData = {}) {
        super(409, 'Conflict Error', message, additionalData);
    }
}
exports.DuplicateError = DuplicateError;
class UnprocessableError extends HttpError {
    constructor(message, additionalData = {}) {
        super(422, 'Unprocessable Error', message, additionalData);
    }
}
exports.UnprocessableError = UnprocessableError;
class ValidationError extends ClientError {
    constructor(jsonValidationError, additionalData = {}) {
        super(jsonValidationError.toString(), additionalData);
    }
}
exports.ValidationError = ValidationError;
class InvalidTransaction extends UnprocessableError {
    constructor(message, additionalData = {}) {
        super(message, additionalData);
    }
}
exports.InvalidTransaction = InvalidTransaction;
class TypeError extends ServerError {
    constructor(message, additionalData = {}) {
        super(message, additionalData);
    }
}
exports.TypeError = TypeError;
class NameError extends ServerError {
    constructor(message, additionalData = {}) {
        super(message, additionalData);
    }
}
exports.NameError = NameError;
class ConflictError extends HttpError {
    constructor(message, additionalData = {}) {
        super(409, 'Conflict Error', message, additionalData);
    }
}
exports.ConflictError = ConflictError;
class InsufficientBalance extends HttpError {
    constructor(message, additionalData = {}) {
        super(409, 'Conflict Error', message, additionalData);
    }
}
exports.InsufficientBalance = InsufficientBalance;
