'use strict'

import * as log4js from 'log4js'
import { DateTime } from 'luxon'
import {
    PortfolioOrderRepository,
    TPortfolioOrder,
    TExchangeOrderFill,
    TExchangeOrderFailed,
    TPortfolioOrderPatch,
    round4,
    TExchangeOrderComplete,
} from '..'

const logger = log4js.getLogger('portfolioOrderEventService')

export class PortfolioOrderEventService {
    private portfolioOrderRepository: PortfolioOrderRepository

    constructor(portfolioOrderRepository: PortfolioOrderRepository) {
        this.portfolioOrderRepository = portfolioOrderRepository
    }

    processFillEvent = async (payload: TExchangeOrderFill) => {
        const orderId = payload.orderId
        const portfolioId = payload.portfolioId
        let portfolioOrder = await this.portfolioOrderRepository.getDetailAsync(portfolioId, orderId)
        if (!portfolioOrder) {
            return
        }
        portfolioOrder.filledSize = (portfolioOrder.filledSize || 0) + payload.filledSize
        portfolioOrder.filledValue = (portfolioOrder.filledValue || 0) + payload.filledValue
        portfolioOrder.filledPrice =
            portfolioOrder.filledSize === 0
                ? 0
                : Math.abs(round4(portfolioOrder.filledValue / portfolioOrder.filledSize))
        portfolioOrder.sizeRemaining = payload.sizeRemaining

        this.portfolioOrderRepository.appendOrderEvent(portfolioId, orderId, payload)

        const orderUpdate: TPortfolioOrderPatch = {
            filledSize: portfolioOrder.filledSize,
            filledValue: portfolioOrder.filledValue,
            filledPrice: portfolioOrder.filledPrice,
            sizeRemaining: portfolioOrder.sizeRemaining,
            executedAt: DateTime.utc().toString(),
        }

        await this.portfolioOrderRepository.updateAsync(portfolioId, orderId, orderUpdate)

        return portfolioOrder
    }

    processCompleteEvent = async (payload: TExchangeOrderComplete) => {
        const orderId = payload.orderId
        const portfolioId = payload.portfolioId
        let portfolioOrder = await this.portfolioOrderRepository.getDetailAsync(portfolioId, orderId)
        if (!portfolioOrder) {
            return
        }

        switch (portfolioOrder.orderStatus) {
            case 'received':
                portfolioOrder = this._updateStatus(portfolioOrder, 'filled')
                portfolioOrder = this._close(portfolioOrder)
                break

            case 'filled':
            case 'failed':
            default:
                logger.warn(`handleOrderEvent: handleFailedEvent(${portfolioOrder.orderId}) IGNORED`)
                break
        }

        const orderUpdate: TPortfolioOrderPatch = {
            orderState: portfolioOrder.orderState,
            orderStatus: portfolioOrder.orderStatus,
            closedAt: DateTime.utc().toString(),
        }

        this.portfolioOrderRepository.updateAsync(portfolioId, orderId, orderUpdate)

        return portfolioOrder
    }

    processFailEvent = async (payload: TExchangeOrderFailed) => {
        const orderId = payload.orderId
        const portfolioId = payload.portfolioId
        let portfolioOrder = await this.portfolioOrderRepository.getDetailAsync(portfolioId, orderId)
        if (!portfolioOrder) {
            return
        }

        switch (portfolioOrder.orderStatus) {
            case 'received':
                portfolioOrder = this._updateStatus(portfolioOrder, 'failed', payload.reason)
                portfolioOrder = this._close(portfolioOrder)
                break

            case 'filled':
            case 'failed':
            default:
                logger.warn(
                    `handleOrderEvent: handleFailedEvent(${portfolioOrder.orderId}) orderStatus: ${portfolioOrder.orderStatus} - ${payload} - IGNORED`,
                )
                break
        }

        this.portfolioOrderRepository.appendOrderEvent(portfolioId, orderId, payload)

        const orderUpdate: TPortfolioOrderPatch = {
            orderState: portfolioOrder.orderState,
            orderStatus: portfolioOrder.orderStatus,
            closedAt: DateTime.utc().toString(),
        }
        if (portfolioOrder.reason) orderUpdate.reason = portfolioOrder.reason

        this.portfolioOrderRepository.updateAsync(portfolioId, orderId, orderUpdate)
        return portfolioOrder
    }

    ////////////////////////////////////////////////////////
    // PRIVATE
    ////////////////////////////////////////////////////////
    private _close = (portfolioOrder: TPortfolioOrder) => {
        logger.trace(`update state for order: ${portfolioOrder.orderId} to closed`)
        portfolioOrder.orderState = 'closed'
        portfolioOrder.closedAt = DateTime.utc().toString()
        return portfolioOrder
    }

    private _updateStatus = (portfolioOrder: TPortfolioOrder, newStatus: string, reason?: string) => {
        const reasonString = reason ? `reason: ${reason}` : ''
        logger.trace(`update orderStatus for order: ${portfolioOrder.orderId} to ${newStatus} ${reasonString}`)
        portfolioOrder.orderStatus = newStatus
        if (reason) {
            portfolioOrder.reason = reason
        }
        return portfolioOrder
    }
}
