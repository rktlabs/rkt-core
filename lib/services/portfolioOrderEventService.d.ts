import { TEvent } from '.';
export declare class PortfolioOrderEventService {
    private orderRepository;
    constructor(db: FirebaseFirestore.Firestore);
    handleOrderEventAsync: (payload: TEvent) => Promise<void>;
    private processOrderEvent;
    private appendOrderEvent;
    private close;
    private updateStatus;
    private processFillEvent;
    private processFailedEvent;
    private processCompleteEvent;
}
