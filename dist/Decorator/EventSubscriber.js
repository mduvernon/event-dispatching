"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventSubscriber = exports.event_subscriber = exports.DECORATOR_EVENT_SUBSCRIBER_META_KEY = void 0;
exports.DECORATOR_EVENT_SUBSCRIBER_META_KEY = Symbol.for("event_dispatching.decorator.EventSubscriber");
function EventSubscriberFn(options) {
    return (target) => {
        // Grab the subscribers list (if any), then append
        const subscribers = Reflect.getMetadata(exports.DECORATOR_EVENT_SUBSCRIBER_META_KEY, Reflect) || [];
        subscribers.push({
            className: target.name,
            instance: undefined,
            object: target,
            options
        });
        // Store the subscribers metadata on the target class
        Reflect.defineMetadata(exports.DECORATOR_EVENT_SUBSCRIBER_META_KEY, subscribers, Reflect);
    };
}
exports.event_subscriber = EventSubscriberFn;
exports.EventSubscriber = EventSubscriberFn;
//# sourceMappingURL=EventSubscriber.js.map