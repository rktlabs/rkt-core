'use strict'

import { HALSerializer } from 'hal-serializer'

export const serializeCollection = (selfUrl: string, baseUrl: string, qs: any, data: any) => {
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
        self: {
            href: `${selfUrl}`,
            rel: 'collection:assets',
        },
    }

    if (page > 1 || hasMore) {
        collectionLinks.first = {
            href: `${baseUrl}/activity/?${linkQS}page=1&pageSize=${pageSize}`,
        }
        if (page > 1) {
            collectionLinks.prev = {
                href: `${baseUrl}/activity?${linkQS}page=${page - 1}&pageSize=${pageSize}`,
            }
        }
        if (hasMore) {
            collectionLinks.next = {
                href: `${baseUrl}/activity?${linkQS}page=${page + 1}&pageSize=${pageSize}`,
            }
        }
    }

    const serializer = new HALSerializer()

    serializer.register('activity', {
        whitelist: ['createdAt', 'portfolioId', 'assetId', 'units', 'source'],
        links: (record: any) => {
            const links: any = {
                asset: {
                    href: `${baseUrl}/assets/${record.assetId}`,
                    rel: 'asset',
                },
                portfolio: {
                    href: `${baseUrl}/portfolios/${record.portfolioId}`,
                    rel: 'asset',
                },
                transaction: {
                    href: `${baseUrl}/transactions/${record.transactionId}`,
                    rel: 'transaction',
                },
            }
            if (record.orderId) {
                links.order = {
                    href: `${baseUrl}/portfolios/${record.orderPortfolioId}/orders/${record.orderId}`,
                    rel: 'portfolioOrder',
                }
                links.exchangeOrder = {
                    href: `${baseUrl}/exchange/orders/${record.orderId}`,
                    rel: 'exchangeOrder',
                }
            }
            if (record.tradeId) {
                links.trade = {
                    href: `${baseUrl}/exchange/trades/${record.tradeId}`,
                    rel: 'trade',
                }
            }
            return links
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

    const serialized = serializer.serialize('activity', data, {
        page,
        pageSize,
        count: displayCount,
    })
    return serialized
}
