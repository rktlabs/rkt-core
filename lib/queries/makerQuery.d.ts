import { MakerRepository } from '../repositories/maker/makerRepository';
export declare class MakerQuery {
    makerRepository: MakerRepository;
    constructor();
    getListAsync(qs?: any): Promise<{
        data: import("../services/makerService/makers/makerBase/types").TMaker[];
    }>;
    getDetailAsync(id: string): Promise<import("../services/makerService/makers/makerBase/types").TMaker | null>;
}
