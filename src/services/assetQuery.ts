import { AssetRepository } from '../repositories/assetRepository'
// import { AssetOutreachRepository } from '../repositories/assetOutreachRepository'

export class AssetQuery {
    assetRepository: AssetRepository
    // outreachRepository: AssetOutreachRepository

    constructor() {
        this.assetRepository = new AssetRepository()
        // this.outreachRepository = new AssetOutreachRepository()
    }

    async getListAsync(qs?: any) {
        //const rowcount: number = await this.assetRepository.countListAsync(clientId, qs)
        return {
            data: await this.assetRepository.listAssets(qs),
            rowcount: 111,
        } // TODO: no count
    }

    async getDetailAsync(id: string) {
        const assetDetail = await this.assetRepository.getAsset(id)

        // if (assetDetail) {
        //   // const outreachList = await this.outreachRepository.getListForAssetAsync(clientId, id)
        //   // assetDetail.assetOutreaches = outreachList.map((assetOutreach: any) => {
        //   //   return {
        //   //     id: assetOutreach.id,
        //   //     assetId: assetOutreach.assetId,
        //   //     outreachId: assetOutreach.outreachId,
        //   //     outreachName: assetOutreach.outreachName,
        //   //     programId: assetOutreach.programId,
        //   //     programName: assetOutreach.programName,
        //   //     clientId: assetOutreach.clientId,
        //   //     clientName: assetOutreach.clientName,
        //   //     memberXid: assetOutreach.memberXid,

        //   //     channel: assetOutreach.channel,
        //   //     outreachStatus: assetOutreach.outreachStatus,
        //   //     firstAttemptAt: assetOutreach.firstAttemptAt,
        //   //     lastAttemptAt: assetOutreach.lastAttemptAt,
        //   //     attempts: assetOutreach.attempts,
        //   //     lastBestResult: assetOutreach.lastBestResult,
        //   //   }
        //   // })
        // }
        return assetDetail
    }
}
