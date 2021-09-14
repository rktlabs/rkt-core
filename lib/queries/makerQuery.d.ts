import { MakerRepository } from '../repositories/maker/makerRepository';
export declare class MakerQuery {
    makerRepository: MakerRepository;
    constructor();
    getListAsync(qs?: any): Promise<{
        data: import("../services/makerFactory/makers/makerBase/types").TMaker[];
    }>;
    getDetailAsync(id: string): Promise<import("../services/makerFactory/makers/makerBase/types").TMaker | null>;
}
