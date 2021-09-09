import { HALSerializer } from 'hal-serializer'

export const serialize = (selfUrl: string, baseUrl: string, data: any) => {
    const serializer = new HALSerializer()

    serializer.register('exchangeTrade', {
        whitelist: ['tradeAt', 'lastPrice', 'lastTrade'],
        links: (record: any) => {
            return {
                self: { href: `${selfUrl}`, rel: 'exchangeTrade' },
                asset: {
                    href: `${baseUrl}/assets/${record.assetId}`,
                    rel: 'asset',
                    id: record.assetId,
                },
            }
        },
    })

    const serialized = serializer.serialize('exchangeTrade', data)
    return serialized
}

export const serializeCollection = (selfUrl: string, baseUrl: string, qs: any, data: any /* , rowcount: number */) => {
    const filter = Object.assign({}, qs)
    const page = filter.page ? parseInt(filter.page, 10) : 1
    const pageSize = Math.min(filter.pageSize ? parseInt(filter.pageSize, 10) : 25, 1000)
    delete filter.page // ignore "page" querystring parm
    delete filter.pageSize // ignore "page" querystring parm
    //const pages = Math.floor((rowcount - 1) / pageSize) + 1

    const newFilter = []
    for (const v in filter) {
        if (filter.hasOwnProperty(v)) {
            newFilter.push(encodeURIComponent(v) + '=' + encodeURIComponent(filter[v]))
        }
    }
    const linkQS = newFilter && newFilter.length > 0 ? newFilter.join('&') + '&' : ''

    const recordCount = data.length
    const hasMore = recordCount === pageSize
    const displayCount = data.length

    const collectionLinks: any = {
        self: { href: `${selfUrl}`, rel: 'collection:exchangeTrades' },
    }

    if (page > 1 || hasMore) {
        collectionLinks.first = {
            href: `${baseUrl}?${linkQS}page=1&pageSize=${pageSize}`,
        }
        if (page > 1) {
            collectionLinks.prev = {
                href: `${baseUrl}?${linkQS}page=${page - 1}&pageSize=${pageSize}`,
            }
        }
        if (hasMore) {
            collectionLinks.next = {
                href: `${baseUrl}?${linkQS}page=${page + 1}&pageSize=${pageSize}`,
            }
        }
    }

    const serializer = new HALSerializer()

    serializer.register('exchangeTrades', {
        // whitelist: ['type', 'exchangeTradeId', 'portfolioId', 'displayName'],
        links: (record: any) => {
            return {
                self: `${baseUrl}/assets/${record.assetId}`,
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

    const serialized = serializer.serialize('exchangeTrades', data, {
        page,
        pageSize,
        count: displayCount,
    })

    return serialized
}