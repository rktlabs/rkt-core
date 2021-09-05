import { HALSerializer } from 'hal-serializer'

export const serialize = (selfUrl: string, baseUrl: string, data: any) => {
    //const baseUrl = req.fantUrls.baseUrl

    const serializer = new HALSerializer()

    serializer.register('asset', {
        whitelist: [
            'createdAt',
            'type',
            'assetId',
            'symbol',
            'ownerId',
            'displayName',
            // 'initialPrice',
            'bid',
            'ask',
            'last',
            // 'cumulativeEarnings',
        ],
        links: (record: any) => {
            return {
                self: { href: `${selfUrl}`, rel: 'asset' },
                earnings: { href: `${baseUrl}/assets/${record.assetId}/earnings`, rel: 'collection:earning' },
                //     }
                // },
                // associations: function (data: any) {
                //     return {
                // earner: {
                //     href: `${baseUrl}/earners/${data.earnerId}`,
                //     rel: 'earner',
                //     id: data.earnerId,
                //     title: data.earnerDisplayName,
                // },
                league: {
                    href: `${baseUrl}/leagues/${data.leagueId}`,
                    rel: 'league',
                    id: data.leagueId,
                    title: data.leagueDisplayName,
                },
                maker: {
                    href: `${baseUrl}/makers/${data.assetId}`,
                    rel: 'maker',
                    id: data.assetId,
                },
                portfolio: {
                    href: `${baseUrl}/portfolios/${data.portfolioId}`,
                    rel: 'portfolio',
                    id: data.portfolioId,
                },
            }
        },
    })

    const serialized = serializer.serialize('asset', data)
    return serialized
}

//export const serializeCollection = (req: any, data: any) => {
export const serializeCollection = (selfUrl: string, baseUrl: string, qs: any, data: any /* , rowcount: number */) => {
    // const baseUrl = req.fantUrls.baseUrl
    // const selfUrl = req.fantUrls.selfUrl

    // const rowcount = data.length
    // let page = parseInt(req.query.page || '1', 10)
    // if (page <= 1) {
    //     page = 1
    // }
    // const pageSize = Math.min(parseInt(req.query.pageSize || '25', 10), 1000)

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
            href: `${baseUrl}/assets?${linkQS}page=1&pageSize=${pageSize}`,
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
        // if (page <= pages) {
        //     collectionLinks.last = {
        //         href: `${baseUrl}/assets?${linkQS}page=${pages}`,
        //     }
        // }
    }

    const serializer = new HALSerializer()

    serializer.register('assets', {
        whitelist: ['type', 'assetId', 'symbol', 'displayName', 'bid', 'ask', 'last'],
        links: (record: any) => {
            return {
                self: { href: `${baseUrl}/assets/${record.assetId}`, rel: 'asset' },
            }
        },
        topLevelLinks: collectionLinks,
        topLevelMeta: (extraOptions: any) => {
            return {
                page: extraOptions.page,
                pageSize: extraOptions.pageSize,
                count: extraOptions.count,
                // pages: extraOptions.pages,
                // total: extraOptions.total,
            }
        },
    })

    const serialized = serializer.serialize('assets', data, {
        page,
        pageSize,
        count: displayCount,
        // pages: pages,
        // total: rowcount,
    })
    return serialized
}
