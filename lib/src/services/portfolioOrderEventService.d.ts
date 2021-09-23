import { TNotification } from '.';
export declare class PortfolioOrderEventService {
    private orderRepository;
    constructor(db: FirebaseFirestore.Firestore);
    handleOrderEventAsync: (payload: TNotification) => Promise<void>;
    private processOrderEvent;
    private appendOrderEvent;
    private close;
    private updateStatus;
    private processFillEvent;
    private processFailedEvent;
    private processCompleteEvent;
}
