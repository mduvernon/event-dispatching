"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.On = exports.on = exports.DECORATOR_ON_META_KEY = void 0;
exports.DECORATOR_ON_META_KEY = Symbol.for("event_dispatching.decorator.On");
/**
 * Method decorator to subscribe a method to a specific event.
 *
 * @param {string | string[]} eventNameOrNames The name of the client-side event to listen for (without namespace prefix).
 * @param {EventOptions} [options] Optional event options.
 */
function OnFn(eventNameOrNames, options) {
    const eventNames = Array.isArray(eventNameOrNames)
        ? eventNameOrNames
        : [eventNameOrNames];
    // Ensure eventName is a string or an array of strings
    return (target, methodName, descriptor) => {
        // Ensure the event name is a string or an array of strings
        const events = Reflect.getOwnMetadata(exports.DECORATOR_ON_META_KEY, Reflect) || [];
        events.push({
            className: target.constructor.name,
            methodName: String(methodName),
            object: target,
            descriptor,
            eventNames,
            options,
        });
        // Store the event metadata on the target class
        Reflect.defineMetadata(exports.DECORATOR_ON_META_KEY, events, Reflect);
    };
}
exports.on = OnFn;
exports.On = OnFn;
//# sourceMappingURL=On.js.map