export declare class HttpError extends Error {
    status: number;
    title: string;
    additionalData: any;
    constructor(status: number, title: string, message: string, additionalData?: any);
    get name(): string;
    get statusCode(): number;
    get statusTitle(): string;
    get detail(): string;
}
export declare class ServerError extends HttpError {
    constructor(message: string, additionalData?: any);
}
export declare class NotFoundError extends HttpError {
    constructor(message: string, additionalData?: any);
}
export declare class ClientError extends HttpError {
    constructor(message: string, additionalData?: any);
}
export declare class DuplicateError extends HttpError {
    constructor(message: string, additionalData?: any);
}
export declare class ArgumentError extends HttpError {
    constructor(message: string, additionalData?: any);
}
export declare class UnprocessableError extends HttpError {
    constructor(message: string, additionalData?: any);
}
export declare class ValidationError extends ClientError {
    constructor(jsonValidationError: any, additionalData?: any);
}
export declare class InvalidTransaction extends UnprocessableError {
    constructor(message: string, additionalData?: any);
}
export declare class CancelOrderFailure extends UnprocessableError {
    constructor(message: string);
}
export declare class Expired extends UnprocessableError {
    constructor(message: string, additionalData?: any);
}
export declare class TypeError extends ServerError {
    constructor(message: string, additionalData?: any);
}
export declare class NameError extends ServerError {
    constructor(message: string, additionalData?: any);
}
export declare class NotReady extends HttpError {
    constructor(message: string, additionalData?: any);
}
export declare class ConflictError extends HttpError {
    constructor(message: string, additionalData?: any);
}
export declare class InsufficientBalance extends HttpError {
    constructor(message: string, additionalData?: any);
}
