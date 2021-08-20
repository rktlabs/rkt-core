import { HALSerializer } from 'hal-serializer'

export const serialize = (req: any, data: any) => {
    const baseUrl = req.fantUrls.baseUrl

    const serializer = new HALSerializer()

    serializer.register('earner', {
        whitelist: [
            'createdAt',
            'earnerId',
            'ownerId',
            'symbol',
            'displayName',
            'subject',
            'scale',
            'cumulativeEarnings',
        ],
        links: (record: any) => {
            return {
                self: { href: `${baseUrl}/${record.earnerId}`, rel: 'earner' },
                earnings: { href: `${baseUrl}/${record.earnerId}/earnings`, rel: 'collection:earning' },
            }
        },
    })

    const serialized = serializer.serialize('earner', data)
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

    serializer.register('earners', {
        whitelist: ['earnerId', 'displayName', 'symbol', 'scale', 'cumulativeEarnings'],
        links: (record: any) => {
            return {
                self: { href: `${baseUrl}/${record.earnerId}`, rel: 'earner' },
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

    const serialized = serializer.serialize('earners', data, {
        page,
        pageSize,
        count: displayCount,
    })
    return serialized
}