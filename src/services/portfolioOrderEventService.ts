'use strict'

import * as log4js from 'log4js'
import { DateTime } from 'luxon'
import {
    PortfolioOrderRepository,
    TPortfolioOrder,
    TPortfolioOrderFill,
    TPortfolioOrderComplete,
    TPortfolioOrderFailed,
    TPortfolioOrderPatch,
    round4,
} from '..'

const logger = log4js.getLogger()

export class PortfolioOrderEventService {
    private portfolioOrderRepository: PortfolioOrderRepository

    constructor(portfolioOrderRepository: PortfolioOrderRepository) {
        this.portfolioOrderRepository = portfolioOrderRepository
    }

    processFillEvent = async (payload: TPortfolioOrderFill) => {
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
        }

        await this.portfolioOrderRepository.updateAsync(portfolioId, orderId, orderUpdate)

        return portfolioOrder
    }

    processCompleteEvent = async (payload: TPortfolioOrderComplete) => {
        const orderId = payload.orderId
        const portfolioId = payload.portfolioId
        let portfolioOrder = await this.portfolioOrderRepository.getDetailAsync(portfolioId, orderId)
        if (!portfolioOrder) {
            return
        }

        switch (portfolioOrder.status) {
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
            state: portfolioOrder.state,
            status: portfolioOrder.status,
            closedAt: DateTime.utc().toString(),
        }

        this.portfolioOrderRepository.updateAsync(portfolioId, orderId, orderUpdate)

        return portfolioOrder
    }

    processFailEvent = async (payload: TPortfolioOrderFailed) => {
        const orderId = payload.orderId
        const portfolioId = payload.portfolioId
        let portfolioOrder = await this.portfolioOrderRepository.getDetailAsync(portfolioId, orderId)
        if (!portfolioOrder) {
            return
        }

        switch (portfolioOrder.status) {
            case 'received':
                portfolioOrder = this._updateStatus(portfolioOrder, 'failed', payload.reason)
                portfolioOrder = this._close(portfolioOrder)
                break

            case 'filled':
            case 'failed':
            default:
                logger.warn(
                    `handleOrderEvent: handleFailedEvent(${portfolioOrder.orderId}) status: ${portfolioOrder.status} - ${payload} - IGNORED`,
                )
                break
        }

        this.portfolioOrderRepository.appendOrderEvent(portfolioId, orderId, payload)

        const orderUpdate: TPortfolioOrderPatch = {
            state: portfolioOrder.state,
            status: portfolioOrder.status,
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
        portfolioOrder.state = 'closed'
        portfolioOrder.closedAt = DateTime.utc().toString()
        return portfolioOrder
    }

    private _updateStatus = (portfolioOrder: TPortfolioOrder, newStatus: string, reason?: string) => {
        const reasonString = reason ? `reason: ${reason}` : ''
        logger.trace(`update status for order: ${portfolioOrder.orderId} to ${newStatus} ${reasonString}`)
        portfolioOrder.status = newStatus
        if (reason) {
            portfolioOrder.reason = reason
        }
        return portfolioOrder
    }
}
