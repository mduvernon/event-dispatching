export declare const DECORATOR_EVENT_SUBSCRIBER_META_KEY: unique symbol;
export interface EventSubscriberOptions {
}
declare function EventSubscriberFn(options?: EventSubscriberOptions): ClassDecorator;
export declare const event_subscriber: typeof EventSubscriberFn;
export declare const EventSubscriber: typeof EventSubscriberFn;
export {};
