import { HALSerializer } from 'hal-serializer'

export const serialize = (req: any, data: any) => {
    const baseUrl = req.fantUrls.baseUrl
    //const proto = req.fantUrls.proto
    //const host = req.fantUrls.host

    const serializer = new HALSerializer()

    serializer.register('exchangeQuote', {
        whitelist: ['quoteAt', 'lastPrice', 'lastTrade'],
        links: (record: any) => {
            return {
                self: { href: `${baseUrl}/quotes/${record.assetId}`, rel: 'exchangeQuote' },
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
    })

    const serialized = serializer.serialize('exchangeQuote', data)
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

    serializer.register('exchangeQuotes', {
        // whitelist: ['type', 'exchangeQuoteId', 'portfolioId', 'displayName'],
        links: (record: any) => {
            return {
                self: `${proto}//${host}/exchange/quotes/${record.assetId}`,
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

    const serialized = serializer.serialize('exchangeQuotes', data, {
        page,
        pageSize,
        count: displayCount,
    })
    return serialized
}
