import { HALSerializer } from 'hal-serializer'

export const serialize = (req: any, data: any) => {
    const baseUrl = req.fantUrls.baseUrl
    const proto = req.fantUrls.proto
    const host = req.fantUrls.host

    const serializer = new HALSerializer()

    serializer.register('contract', {
        whitelist: [
            'createdAt',
            'ownerId',
            'displayName',
            'description',
            'currencySource',
            'pt',
            'key',
            'startAt',
            'endAt',
            'acceptEarningsAfter',
            'ignoreEarningsAfter',
            'tags',
            'managedAssets',
            'currencyId',
            'currencySource',
        ],
        links: (record: any) => {
            return {
                self: { href: `${baseUrl}/${record.contractId}`, rel: 'contract' },
                portfolio: { href: `${proto}//${host}/portfolios/${record.portfolioId}`, rel: 'portfolio' },
            }
        },
    })

    const serialized = serializer.serialize('contract', data)
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

    serializer.register('contracts', {
        whitelist: [
            //'createdAt',
            //'ownerId',
            'displayName',
            'description',
            //'currencySource',
            //'pt',
            //'key',
            'startAt',
            'endAt',
        ],
        links: (record: any) => {
            return {
                self: { href: `${baseUrl}/${record.contractId}`, rel: 'contract' },
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

    const serialized = serializer.serialize('contracts', data, {
        page,
        pageSize,
        count: displayCount,
    })
    return serialized
}
