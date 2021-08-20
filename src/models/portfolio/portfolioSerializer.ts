import { HALSerializer } from 'hal-serializer'

export const serialize = (req: any, data: any) => {
    const baseUrl = req.fantUrls.baseUrl

    const serializer = new HALSerializer()

    serializer.register('portfolio', {
        whitelist: ['type', 'name', 'displayName', 'ownerId', 'createdAt'],
        links: (record: any) => {
            return {
                self: { href: `${baseUrl}/${record.portfolioId}`, rel: 'portfolio' },
                assets: { href: `${baseUrl}/${record.portfolioId}/assets`, rel: 'assets' },
                activity: { href: `${baseUrl}/${record.portfolioId}/activity`, rel: 'activity' },
                orders: { href: `${baseUrl}/${record.portfolioId}/orders`, rel: 'orders' },
            }
        },
        associations: function (data: any) {
            return {
                portfolio: {
                    href: `${req.fantUrls.proto}//${req.fantUrls.host}/portfolios/${data.portfolioId}`,
                    rel: 'portfolio',
                    id: data.portfolioId,
                },
            }
        },
    })

    const serialized = serializer.serialize('portfolio', data)
    return serialized
}

export const serializeCollection = (req: any, data: any) => {
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

    serializer.register('portfolios', {
        whitelist: ['type', 'portfolioId', 'displayName'],
        links: (record: any) => {
            return {
                self: { href: `${baseUrl}/${record.portfolioId}`, rel: 'portfolio' },
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

    const serialized = serializer.serialize('portfolios', data, {
        page,
        pageSize,
        count: displayCount,
    })
    return serialized
}
