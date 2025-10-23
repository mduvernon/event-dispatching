import { IEventsHandler } from "./IEventsHandler";

export interface IEventSubscriber {
    subscribedTo(): IEventsHandler;
}
