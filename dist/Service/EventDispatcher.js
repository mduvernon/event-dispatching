"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventDispatcher = void 0;
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Types_1 = require("../Resources/Types");
const MetadataRegistry_1 = require("../Registry/MetadataRegistry");
/**
 * The EventDispatcher
 * - The EventDispatcher is a service that dispatches events to registered listeners.
 */
let EventDispatcher = class EventDispatcher {
    /**
     * The constructor
     */
    constructor(_metadataRegistry) {
        /**
         * The handlers
         *
         * @private
         */
        this._handlers = {};
        this._metadataRegistry = _metadataRegistry;
    }
    remove(eventNameOrNamesOrCallback) {
        if (eventNameOrNamesOrCallback instanceof Array) {
            eventNameOrNamesOrCallback.forEach(eventName => this.remove(eventName));
        }
        else if (eventNameOrNamesOrCallback instanceof Function) {
            Object.keys(this._handlers).forEach(key => {
                this._handlers[key]
                    .filter(handler => handler.callback === eventNameOrNamesOrCallback)
                    .forEach(handler => this._handlers[key].splice(this._handlers[key].indexOf(handler), 1));
            });
        }
        else if (typeof eventNameOrNamesOrCallback === "string") {
            this._handlers[eventNameOrNamesOrCallback] = [];
        }
    }
    detach(detachFrom, eventNameOrNamesOrCallback) {
        if (eventNameOrNamesOrCallback instanceof Array) {
            eventNameOrNamesOrCallback.forEach(eventName => this.remove(eventName));
        }
        else if (eventNameOrNamesOrCallback instanceof Function) {
            Object.keys(this._handlers).forEach(key => {
                this._handlers[key]
                    .filter(handler => handler.callback === eventNameOrNamesOrCallback)
                    .forEach(handler => this._handlers[key].splice(this._handlers[key].indexOf(handler), 1));
            });
        }
        else if (typeof eventNameOrNamesOrCallback === "string") {
            const key = eventNameOrNamesOrCallback;
            this._handlers[key]
                .filter(handler => handler.attachedTo === detachFrom)
                .forEach(handler => this._handlers[key].splice(this._handlers[key].indexOf(handler), 1));
        }
        else {
            Object.keys(this._handlers).forEach(key => {
                this._handlers[key]
                    .filter(handler => handler.attachedTo === detachFrom)
                    .forEach(handler => this._handlers[key].splice(this._handlers[key].indexOf(handler), 1));
            });
        }
    }
    attach(attachTo, eventNameOrNames, callback) {
        let eventNames = [];
        if (eventNameOrNames instanceof Array) {
            eventNames = eventNameOrNames;
        }
        else {
            eventNames = [eventNameOrNames];
        }
        eventNames.forEach(eventName => {
            if (!this._handlers[eventName]) {
                this._handlers[eventName] = [];
            }
            this._handlers[eventName].push({ attachedTo: attachTo, callback: callback });
        });
    }
    on(eventNameOrNames, callback) {
        this.attach(undefined, eventNameOrNames, callback);
    }
    dispatch(eventNameOrNames, data) {
        let eventNames = [];
        if (eventNameOrNames instanceof Array) {
            eventNames = eventNameOrNames;
        }
        else if (typeof eventNameOrNames === "string") {
            eventNames = [eventNameOrNames];
        }
        eventNames.forEach(eventName => {
            if (this._handlers[eventName]) {
                this._handlers[eventName].forEach(handler => handler.callback(data));
            }
            const eventsHandlers = this._metadataRegistry
                .findAllEventsHandlersByEventName(eventName);
            for (const className in eventsHandlers) {
                const methods = eventsHandlers[className];
                for (const methodName in methods) {
                    const eventHandler = methods[methodName][eventName];
                    if (eventHandler) {
                        eventHandler(data);
                    }
                }
            }
        });
    }
    asyncDispatch(eventNameOrNames, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let eventNames = [];
            if (eventNameOrNames instanceof Array) {
                eventNames = eventNameOrNames;
            }
            else if (typeof eventNameOrNames === "string") {
                eventNames = [eventNameOrNames];
            }
            yield Promise.all(eventNames.map((eventName) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const eventsHandlers = this._metadataRegistry
                    .findAllEventsHandlersByEventName(eventName);
                for (const className in eventsHandlers) {
                    const methods = eventsHandlers[className];
                    for (const methodName in methods) {
                        const eventHandler = methods[methodName][eventName];
                        if (eventHandler) {
                            yield eventHandler(data);
                        }
                    }
                }
            })));
        });
    }
};
exports.EventDispatcher = EventDispatcher;
exports.EventDispatcher = EventDispatcher = tslib_1.__decorate([
    (0, inversify_1.injectable)(),
    tslib_1.__param(0, (0, inversify_1.inject)(Types_1.TYPES.MetadataRegistry)),
    tslib_1.__metadata("design:paramtypes", [MetadataRegistry_1.MetadataRegistry])
], EventDispatcher);
//# sourceMappingURL=EventDispatcher.js.map