import { HALSerializer } from 'hal-serializer'

export const serialize = (req: any, data: any) => {
    //const baseUrl = req.fantUrls.baseUrl
    const proto = req.fantUrls.proto
    const host = req.fantUrls.host

    const serializer = new HALSerializer()

    serializer.register('orderFill', {
        whitelist: [
            'isPartial',
            'filledValue',
            'orderSide',
            'filledPrice',
            //"portfolioId",
            'orderType',
            'filledSize',
            'isLiquidityStarved',
            'sizeRemaining',
            'orderId',
            'orderSize',
            'isClosed',
            //"assetId"
        ],
        associations: function (data: any) {
            return {
                // asset: {
                //     href: `${req.fantUrls.proto}//${req.fantUrls.host}/assets/${data.assetId}`,
                //     rel: 'asset',
                //     id: data.assetId,
                // },
                portfolio: {
                    href: `${req.fantUrls.proto}//${req.fantUrls.host}/portfolios/${data.portfolioId}`,
                    rel: 'portfolio',
                    id: data.portfolioId,
                },
            }
        },
    })

    serializer.register('trade', {
        whitelist: ['executedAt', 'tradeId', 'taker', 'makers'],
        links: (record: any) => {
            return {
                self: { href: `${proto}//${host}/exchange/trades/${record.tradeId}`, rel: 'collection:trades' },
            }
        },
        associations: function (data: any) {
            return {
                asset: {
                    href: `${req.fantUrls.proto}//${req.fantUrls.host}/assets/${data.assetId}`,
                    rel: 'asset',
                    id: data.assetId,
                },
            }
        },
        embedded: {
            taker: {
                type: 'orderFill',
            },
            makers: {
                type: 'orderFill',
            },
        },
    })

    const serialized = serializer.serialize('trade', data)
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

    serializer.register('trades', {
        whitelist: ['executedAt', 'tradeId', 'assetId'],
        links: (record: any) => {
            return {
                self: { href: `${proto}//${host}/exchange/trades/${record.tradeId}`, rel: 'trade' },
            }
        },
        topLevelLinks: collectionLinks,
        topLevelMeta: (extraOptions: any) => {
            return {
                page: extraOptions.page,
                pageSize: extraOptions.pageSize,
                count: extraOptions.count,
            }
        },
    })

    const serialized = serializer.serialize('trades', data, {
        page,
        pageSize,
        count: displayCount,
    })
    return serialized
}
