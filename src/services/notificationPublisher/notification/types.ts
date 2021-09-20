'use strict'

export type TNotification = {
    notificationType: string
    publishedAt: string
    attributes: any
    nonce: string
    messageId?: string
}
