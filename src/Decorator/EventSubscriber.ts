import { ISubscriberMetadata } from "../Interface";

export const DECORATOR_EVENT_SUBSCRIBER_META_KEY = Symbol.for("event_dispatching.decorator.EventSubscriber");

export interface EventSubscriberOptions { }

function EventSubscriberFn(options?: EventSubscriberOptions): ClassDecorator {

    return (target: Function) => {
        // Grab the subscribers list (if any), then append
        const subscribers: ISubscriberMetadata[] = Reflect.getMetadata(DECORATOR_EVENT_SUBSCRIBER_META_KEY, Reflect) || [];

        subscribers.push({
            className: target.name,
            instance: undefined,
            object: target,
            options
        })

        // Store the subscribers metadata on the target class
        Reflect.defineMetadata(DECORATOR_EVENT_SUBSCRIBER_META_KEY, subscribers, Reflect);
    };
}

export const event_subscriber = EventSubscriberFn;
export const EventSubscriber = EventSubscriberFn;
