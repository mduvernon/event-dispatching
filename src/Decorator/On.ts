import { IEventMetadata, EventOptions } from "../Interface";

export const DECORATOR_ON_META_KEY = Symbol.for("event_dispatching.decorator.On");

/**
 * Method decorator to subscribe a method to a specific event.
 *
 * @param {string | string[]} eventNameOrNames The name of the client-side event to listen for (without namespace prefix).
 * @param {EventOptions} [options] Optional event options.
 */
function OnFn(eventNameOrNames: string | string[], options?: EventOptions): MethodDecorator {

    const eventNames = Array.isArray(eventNameOrNames)
        ? eventNameOrNames
        : [eventNameOrNames];

    // Ensure eventName is a string or an array of strings
    return (target: any, methodName: string | symbol, descriptor: PropertyDescriptor) => {
        // Ensure the event name is a string or an array of strings
        const events: IEventMetadata[] = Reflect.getOwnMetadata(DECORATOR_ON_META_KEY, Reflect) || [];

        events.push({
            className: target.constructor.name,
            methodName: String(methodName),
            object: target,
            descriptor,
            eventNames,
            options,
        });

        // Store the event metadata on the target class
        Reflect.defineMetadata(DECORATOR_ON_META_KEY, events, Reflect);
    };
}

export const on = OnFn;
export const On = OnFn;
