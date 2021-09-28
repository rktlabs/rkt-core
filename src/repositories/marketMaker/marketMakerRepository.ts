'use strict'
import * as log4js from 'log4js'
import { MarketMakerBase } from '../../services/marketMakerService/marketMakerBase/entity'
import { TMarketMaker } from '../../services/marketMakerService/marketMakerBase/types'
import { deleteDocument } from '../../util/deleters'
import { getConnectionProps } from '../getConnectionProps'
import { RepositoryBase } from '../repositoryBase'

const logger = log4js.getLogger('MarketMakerRepository')

const COLLECTION_NAME = 'marketMakers'

export class MarketMakerRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore
    constructor() {
        super()
        this.db = getConnectionProps()
    }

    filterMap: any = {}

    async getListAsync(qs?: any) {
        //logger.trace(`getList ${qs}`)
        let entityRefCollection: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> =
            this.db.collection(COLLECTION_NAME)

        entityRefCollection = this.generateFilterPredicate(qs, this.filterMap, entityRefCollection)
        entityRefCollection = this.generatePagingProperties(qs, entityRefCollection, 'assetId')
        const entityCollectionRefs = await entityRefCollection.get()
        if (!entityCollectionRefs.empty) {
            const makerList = entityCollectionRefs.docs.map((entityDoc) => {
                const entity = entityDoc.data() as TMarketMaker
                return entity
            })
            return makerList
        } else {
            return []
        }
    }

    async getDetailAsync(assetId: string) {
        //logger.trace(`getDetail ${assetId}`)
        const entityRef = this.db.collection(COLLECTION_NAME).doc(assetId)
        const entityDoc = await entityRef.get()

        if (!entityDoc.exists) {
            return null
        } else {
            const entity = entityDoc.data() as TMarketMaker
            return entity
        }
    }

    async storeAsync(entity: MarketMakerBase | TMarketMaker) {
        logger.trace(`store ${entity.assetId}`)
        let theEntity: TMarketMaker
        if (entity instanceof MarketMakerBase) {
            theEntity = this.flattenMaker(entity)
        } else {
            theEntity = entity
        }

        const entityId = theEntity.assetId
        const entityData = JSON.parse(JSON.stringify(theEntity))
        const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId)
        await entityRef.set(entityData)
    }

    async updateMakerStateAsync(assetId: string, stateUpdate: any) {
        logger.trace(`updateMakerState ${assetId}`)
        const entityRef = this.db.collection(COLLECTION_NAME).doc(assetId)
        await entityRef.update(stateUpdate)
    }

    async deleteAsync(assetId: string) {
        logger.trace(`delete ${assetId}`)
        const entityRef = this.db.collection(COLLECTION_NAME).doc(assetId)
        await deleteDocument(entityRef)
    }

    async isPortfolioUsed(portfolioId: string) {
        // check for linked makers
        const entityRefCollection = this.db.collection('makers').where('portfolioId', '==', portfolioId)
        const entityCollectionRefs = await entityRefCollection.get()
        if (entityCollectionRefs.size > 0) {
            const ids = entityCollectionRefs.docs.map((doc) => {
                const data = doc.data()
                return data.assetId
            })

            const idList = ids.join(', ')
            return idList
        } else {
            return null
        }
    }

    ////////////////////////////////////////////////////////
    // PRIVATE
    ////////////////////////////////////////////////////////

    private flattenMaker(entity: MarketMakerBase | TMarketMaker) {
        const makerData: TMarketMaker = {
            createdAt: entity.createdAt,
            type: entity.type,
            assetId: entity.assetId,
            ownerId: entity.ownerId,
            tags: entity.tags,
            params: entity.params,
            quote: entity.quote,
        }
        if (entity.portfolioId) {
            makerData.portfolioId = entity.portfolioId
        }
        return makerData
    }
}
