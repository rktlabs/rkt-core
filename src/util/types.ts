export type ErrorResponse = {
    status: number
    message: string
    path: string
}

export type SuccessResponse = {
    status: number
    body: any
    path: string
}

export type ApiEvent = {
    resource: string
    headers: {
        authorization: string
        'X-Forwarded-Port': string
        'X-Forwarded-Proto': string
    }
    requestContext: {
        path: string
        domainName: string
    }
    queryStringParameters: any
    pathParameters: any

    body: any

    local?: any
}

export type ApiResponse = {
    statusCode: number
    body: string
    headers: any
}
