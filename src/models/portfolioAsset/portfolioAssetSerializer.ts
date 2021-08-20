import { HALSerializer } from 'hal-serializer'

export const serialize = (req: any, portfolioId: any, data: any) => {
    const proto = req.fantUrls.proto
    const host = req.fantUrls.host

    const serializer = new HALSerializer()

    serializer.register('portfolioAsset', {
        whitelist: ['assetId', 'displayName', 'units', 'cost', 'net'],
        links: (record: any) => {
            return {
                self: {
                    href: `${proto}//${host}/portfolios/${portfolioId}/assets/${record.assetId}`,
                    rel: 'portfolioAsset',
                },
                asset: { href: `${proto}//${host}/assets/${record.assetId}`, rel: 'asset' },
            }
        },
    })

    const serialized = serializer.serialize('portfolioAsset', data)
    return serialized
}

export const serializeCollection = (req: any, portfolioId: any, data: any) => {
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

    serializer.register('assets', {
        whitelist: ['assetId', 'displayName', 'units'],
        links: (record: any) => {
            return {
                self: {
                    href: `${proto}//${host}/portfolios/${portfolioId}/assets/${record.assetId}`,
                    rel: 'asset',
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

    const serialized = serializer.serialize('assets', data, {
        page,
        pageSize,
        count: displayCount,
    })
    return serialized
}
