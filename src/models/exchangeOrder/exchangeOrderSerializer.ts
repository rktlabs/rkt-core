import { HALSerializer } from 'hal-serializer'

export const serialize = (req: any, data: any) => {
    //const baseUrl = req.fantUrls.baseUrl
    const proto = req.fantUrls.proto
    const host = req.fantUrls.host

    const serializer = new HALSerializer()

    serializer.register('exchangeOrder', {
        whitelist: [
            //'portfolioId',
            'orderId',
            //'assetId',
            'createdAt',
            'type',
            'orderSide',
            'size',
            'state',
            'status',
            'executedAt',
            'filledSize',
            'filledValue',
            'filledPrice',
            'sizeRemaining',
        ],
        links: (record: any) => {
            return {
                self: {
                    href: `${proto}//${host}/exchange/orders/${record.portfolioId}/${record.orderId}`,
                    rel: 'exchangeOrder',
                },
            }
        },
        associations: function (data: any) {
            return {
                asset: {
                    href: `${req.fantUrls.proto}//${req.fantUrls.host}/assets/${data.assetId}`,
                    rel: 'asset',
                    id: data.assetId,
                },
                portfolio: {
                    href: `${req.fantUrls.proto}//${req.fantUrls.host}/portfolios/${data.portfolioId}`,
                    rel: 'portfolio',
                    id: data.portfolioId,
                },
            }
        },
    })

    const serialized = serializer.serialize('exchangeOrder', data)
    return serialized
}

export const serializeCollection = (req: any, data: any) => {
    const proto = req.fantUrls.proto
    const host = req.fantUrls.host
    const baseUrl = req.fantUrls.baseUrl
    const selfUrl = req.fantUrls.selfUrl

    const recordCount = data.length

    let page = parseInt(req.query.page || '1', 10)
    if (page <= 1) {
        page = 1
    }

    const pageSize = Math.min(parseInt(req.query.pageSize || '25', 10), 1000)
    const hasMore = recordCount === pageSize
    const displayCount = data.length

    const collectionLinks: any = {
        self: { href: `${selfUrl}`, rel: 'collection:assets' },
    }

    if (page > 1 || hasMore) {
        collectionLinks.first = {
            href: `${baseUrl}?page=1&pageSize=${pageSize}`,
        }
        if (page > 1) {
            collectionLinks.prev = {
                href: `${baseUrl}?page=${page - 1}&pageSize=${pageSize}`,
            }
        }
        if (hasMore) {
            collectionLinks.next = {
                href: `${baseUrl}?page=${page + 1}&pageSize=${pageSize}`,
            }
        }
    }

    const serializer = new HALSerializer()

    serializer.register('exchangeOrders', {
        whitelist: [
            'type',
            'orderSide',
            'size',
            'assetId',
            'portfolioId',
            'orderId',
            'createdAt',
            'executedAt',
            'state',
            'status',
        ],
        links: (record: any) => {
            return {
                self: {
                    href: `${proto}//${host}/exchange/orders/${record.portfolioId}/${record.orderId}`,
                    rel: 'collection:exchangeOrders',
                },
            }
        },
        topLevelLinks: collectionLinks,
        topLevelMeta: (extraOptions: any) => {
            return {
                page: extraOptions.page,
                pageSize: extraOptions.pageSize,
                pages: extraOptions.pages,
                count: extraOptions.count,
                total: extraOptions.total,
            }
        },
    })

    const serialized = serializer.serialize('exchangeOrders', data, {
        page,
        pageSize,
        count: displayCount,
    })
    return serialized
}
