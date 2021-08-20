export declare type TEarning = {
    earnedAt?: string;
    units: number;
    event: any;
};
export declare class Earning {
    static serializeCollection(req: any, earnerId: string, data: any): any;
    static sig(earning: TEarning): string;
    static validate(jsonPayload: any): TEarning;
}
