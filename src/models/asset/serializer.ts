'use strict'

import { HALSerializer } from 'hal-serializer'

export const serialize = (selfUrl: string, baseUrl: string, data: any) => {
    const serializer = new HALSerializer()

    serializer.register('asset', {
        whitelist: ['createdAt', 'type', 'assetId', 'symbol', 'ownerId', 'displayName', 'subject'],
        links: () => {
            return {
                self: {
                    href: `${selfUrl}`,
                    rel: 'asset',
                },
                league: {
                    href: `${baseUrl}/leagues/${data.leagueId}`,
                    rel: 'league',
                    id: data.leagueId,
                    title: data.leagueDisplayName,
                },
                portfolio: {
                    href: `${baseUrl}/portfolios/${data.portfolioId}`,
                    rel: 'portfolio',
                    id: data.portfolioId,
                },
                marketMaker: {
                    href: `${baseUrl}/marketMakers/${data.assetId}`,
                    rel: 'marketMaker',
                    id: data.assetId,
                },
                exchangeQuote: {
                    href: `${baseUrl}/exchange/quotes/${data.assetId}`,
                    rel: 'exchangeQuote',
                    id: data.assetId,
                },
            }
        },
    })

    const serialized = serializer.serialize('asset', data)
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
        self: {
            href: `${selfUrl}`,
            rel: 'collection:assets',
        },
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
    }

    const serializer = new HALSerializer()

    serializer.register('assets', {
        whitelist: ['type', 'assetId', 'symbol', 'displayName'],
        links: (record: any) => {
            return {
                self: {
                    href: `${baseUrl}/assets/${record.assetId}`,
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
