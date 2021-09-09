import { MakerRepository } from '../repositories/makerRepository';
export declare class MakerQuery {
    makerRepository: MakerRepository;
    constructor();
    getListAsync(qs?: any): Promise<{
        data: import("..").TMaker[];
    }>;
    getDetailAsync(id: string): Promise<import("..").TMaker | null>;
}
