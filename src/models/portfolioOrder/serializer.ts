import { HALSerializer } from 'hal-serializer'

export const serialize = (selfUrl: string, portfolioId: string, baseUrl: string, data: any) => {
    const serializer = new HALSerializer()

    serializer.register('order', {
        whitelist: [
            'orderId',
            'createdAt',
            'portfolioId',
            'assetId',
            'orderType',
            'orderSide',
            'orderSize',
            'state',
            'status',
            'filledValue',
            'filledPrice',
            'filledSize',
            'orderSizeRemaining',
            'events',
        ],
        links: (record: any) => {
            return {
                self: { href: `${selfUrl}`, rel: 'order' },
                portfolio: { href: `${baseUrl}/portfolios/${portfolioId}`, rel: 'portfolio' },
                asset: { href: `${baseUrl}/assets/${record.assetId}`, rel: 'asset' },
            }
        },
    })

    const serialized = serializer.serialize('order', data)
    return serialized
}

export const serializeCollection = (
    selfUrl: string,
    portfolioId: string,
    baseUrl: string,
    qs: any,
    data: any /* , rowcount: number */,
) => {
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
        self: { href: `${selfUrl}`, rel: 'collection:assets' },
    }

    if (page > 1 || hasMore) {
        collectionLinks.first = {
            href: `${baseUrl}/portfolios/${portfolioId}?${linkQS}page=1&pageSize=${pageSize}`,
        }
        if (page > 1) {
            collectionLinks.prev = {
                href: `${baseUrl}/portfolios/${portfolioId}?${linkQS}page=${page - 1}&pageSize=${pageSize}`,
            }
        }
        if (hasMore) {
            collectionLinks.next = {
                href: `${baseUrl}/portfolios/${portfolioId}?${linkQS}page=${page + 1}&pageSize=${pageSize}`,
            }
        }
    }

    const serializer = new HALSerializer()

    serializer.register('orders', {
        whitelist: ['orderId', 'createdAt', 'assetId', 'orderType', 'orderSide', 'orderSize', 'state', 'status'],
        links: (record: any) => {
            return {
                self: { href: `${baseUrl}/portfolios/${portfolioId}/orders/${record.orderId}`, rel: 'order' },
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

    const serialized = serializer.serialize('orders', data, {
        page,
        pageSize,
        count: displayCount,
    })
    return serialized
}
