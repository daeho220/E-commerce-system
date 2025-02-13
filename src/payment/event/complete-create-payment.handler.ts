import { CompleteCreatePaymentEvent } from './complete-create-payment.event';
import { FakeDataPlatform } from '../../common/fakeDataplatform';
import { IEventHandler, EventsHandler } from '@nestjs/cqrs';

@EventsHandler(CompleteCreatePaymentEvent)
export class CompleteCreatePaymentHandler implements IEventHandler<CompleteCreatePaymentEvent> {
    async handle(event: CompleteCreatePaymentEvent) {
        const fakeDataPlatform = new FakeDataPlatform();
        fakeDataPlatform.send();
    }
}
