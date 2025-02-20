export class CompleteCreatePaymentEvent {
    constructor(
        public readonly paymentId: number,
        public readonly orderId: number,
    ) {}
}
