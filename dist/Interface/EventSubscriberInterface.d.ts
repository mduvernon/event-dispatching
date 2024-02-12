import { EventsHandlerInterface } from "./EventsHandlerInterface";
export interface EventSubscriberInterface {
    subscribedTo(): EventsHandlerInterface;
}
