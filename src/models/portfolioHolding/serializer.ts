import { HALSerializer } from 'hal-serializer'

export const serialize = (selfUrl: string, portfolioId: string, baseUrl: string, data: any) => {
    // const proto = req.fantUrls.proto
    // const host = req.fantUrls.host

    const serializer = new HALSerializer()

    serializer.register('portfolioAsset', {
        whitelist: ['assetId', 'displayName', 'units', 'cost', 'net'],
        links: (record: any) => {
            return {
                self: {
                    href: `${baseUrl}/portfolios/${portfolioId}/assets/${record.assetId}`,
                    rel: 'portfolioAsset',
                },
                asset: { href: `${baseUrl}/assets/${record.assetId}`, rel: 'asset' },
            }
        },
    })

    const serialized = serializer.serialize('portfolioAsset', data)
    return serialized
}

export const serializeCollection = (selfUrl: string, portfolioId: string, baseUrl: string, qs: any, data: any) => {
    const filter = Object.assign({}, qs)
    const page = filter.page ? parseInt(filter.page, 10) : 1
    const pageSize = Math.min(filter.pageSize ? parseInt(filter.pageSize, 10) : 25, 1000)
    delete filter.page // ignore "page" querystring parm
    delete filter.pageSize // ignore "page" querystring parm

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
            href: `${baseUrl}/assets?${linkQS}page=1&pageSize=${pageSize}`, // TODO: Fix - not rigtht link - need portfolio
        }
        if (page > 1) {
            collectionLinks.prev = {
                href: `${baseUrl}/assets?${linkQS}page=${page - 1}&pageSize=${pageSize}`,
            }
        }
        if (hasMore) {
            collectionLinks.next = {
                href: `${baseUrl}/assets?${linkQS}page=${page + 1}&pageSize=${pageSize}`,
            }
        }
    }

    const serializer = new HALSerializer()

    serializer.register('assets', {
        whitelist: ['assetId', 'displayName', 'units'],
        links: (record: any) => {
            return {
                self: {
                    href: `${baseUrl}/portfolios/${portfolioId}/assets/${record.assetId}`,
                    rel: 'asset',
                },
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

    const serialized = serializer.serialize('assets', data, {
        page,
        pageSize,
        count: displayCount,
    })
    return serialized
}
