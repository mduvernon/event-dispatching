"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventDispatching = void 0;
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Types_1 = require("../Resources/Types");
const MetadataRegistry_1 = require("../Registry/MetadataRegistry");
const utils_1 = require("../Lib/utils");
/**
 * EventDispatching
 * A service that dispatches events to registered listeners, supporting both
 * dynamically attached listeners and static listeners from a MetadataRegistry.
 */
let EventDispatching = class EventDispatching {
    /**
     * Constructor
     *
     * @param _metadataRegistry Optional MetadataRegistry for static event handlers.
     */
    constructor(_metadataRegistry) {
        this._metadataRegistry = _metadataRegistry;
        /**
         * Internal storage for all dynamically attached event handlers.
         */
        this._handlers = {};
    }
    // -------------------------------------------------------------------------
    // Public API: Registering Listeners
    // -------------------------------------------------------------------------
    /**
     * Registers a listener for a given event.
     *
     * @param event The name of the event to listen for.
     * @param callback The function to execute when the event is dispatched.
     */
    on(event, callback) {
        this.attach(undefined, String(event), callback);
    }
    /**
     * Registers a one-time listener for a given event.
     * The listener will be automatically removed after it is executed once.
     *
     * @param event The name of the event to listen for.
     * @param callback The function to execute when the event is dispatched.
     */
    once(event, callback) {
        this.attach(undefined, String(event), callback, true);
    }
    /**
     * Attaches a listener, optionally associating it with an "owner" object.
     * This is useful for automatically detaching listeners when an object is destroyed.
     *
     * @param attachedTo An "owner" object to associate the listener with.
     * @param eventNames The event name or array of event names.
     * @param callback The function to execute.
     * @param once If true, the listener will be removed after one execution.
     */
    attach(attachedTo, eventNames, callback, once = false) {
        const events = Array.isArray(eventNames) ? eventNames : [eventNames];
        for (const event of events) {
            const eventKey = String(event);
            if (!this._handlers[eventKey]) {
                this._handlers[eventKey] = [];
            }
            this._handlers[eventKey].push({
                attachedTo,
                callback,
                once
            });
        }
    }
    // -------------------------------------------------------------------------
    // Public API: Removing Listeners
    // -------------------------------------------------------------------------
    /**
     * Detaches listeners associated with a specific "owner" object.
     *
     * @param detachFrom The "owner" object.
     * @param eventNameOrNamesOrCallback
     * - If a callback, removes that specific callback for that owner.
     * - If an event name or array, removes all listeners for that owner and event(s).
     * - If omitted, removes *all* listeners associated with that owner for *all* events.
     */
    detach(detachFrom, eventNameOrNamesOrCallback) {
        if (typeof eventNameOrNamesOrCallback === "function") {
            // Detach by callback instance
            this._filterHandlers(h => h.callback !== eventNameOrNamesOrCallback || h.attachedTo !== detachFrom);
        }
        else if (typeof eventNameOrNamesOrCallback === "string") {
            // Detach all for a specific event
            this._filterEventHandlers(eventNameOrNamesOrCallback, h => h.attachedTo !== detachFrom);
        }
        else if (Array.isArray(eventNameOrNamesOrCallback)) {
            // Detach all for multiple events
            for (const event of eventNameOrNamesOrCallback) {
                this._filterEventHandlers(event, h => h.attachedTo !== detachFrom);
            }
        }
        else {
            // Detach all for this owner
            this._filterHandlers(h => h.attachedTo !== detachFrom);
        }
    }
    /**
     * Removes listeners globally, regardless of their "owner".
     *
     * @param eventNameOrNamesOrCallback
     * - If a callback, removes that specific callback from *all* events.
     * - If an event name, removes *all* listeners for that event.
     * - If an array of event names, removes *all* listeners for those events.
     */
    remove(eventNameOrNamesOrCallback) {
        if (typeof eventNameOrNamesOrCallback === "function") {
            // Remove by callback instance globally
            this._filterHandlers(h => h.callback !== eventNameOrNamesOrCallback);
        }
        else if (typeof eventNameOrNamesOrCallback === "string") {
            // Remove all handlers for a specific event
            delete this._handlers[eventNameOrNamesOrCallback];
        }
        else if (Array.isArray(eventNameOrNamesOrCallback)) {
            // Remove all handlers for multiple events
            for (const event of eventNameOrNamesOrCallback) {
                delete this._handlers[String(event)];
            }
        }
    }
    /**
     * Removes all dynamically attached listeners from the dispatcher.
     */
    detachAll() {
        this._handlers = {};
    }
    // -------------------------------------------------------------------------
    // Public API: Dispatching Events
    // -------------------------------------------------------------------------
    /**
     * Dispatches an event synchronously.
     * Executes all listeners and returns an array of non-empty results.
     *
     * @param eventNames The event name or array of event names to dispatch.
     * @param data The data payload to pass to the listeners.
     * @returns An array of results from listeners that returned a non-empty value.
     */
    dispatch(eventNames, data) {
        const events = Array.isArray(eventNames) ?
            eventNames :
            [eventNames];
        const allResults = [];
        for (const event of events) {
            const eventKey = String(event);
            const { dynamicHandlers, metaCallbacks } = this._getHandlersForEvent(eventKey);
            // Execute dynamic handlers
            const dynamicResults = dynamicHandlers === null || dynamicHandlers === void 0 ? void 0 : dynamicHandlers.map(handler => this._executeHandler(handler, data, eventKey));
            // Execute metadata handlers
            const metaResults = metaCallbacks === null || metaCallbacks === void 0 ? void 0 : metaCallbacks.map(fn => this._executeMetaHandler(fn, data, eventKey));
            allResults.push(...dynamicResults, ...metaResults);
        }
        // Filter out any empty/undefined results
        return allResults.filter(r => !(0, utils_1.isEmpty)(r));
    }
    /**
     * Dispatches an event asynchronously.
     * Executes all listeners (awaiting promises) and returns an array of non-empty results.
     *
     * @param eventNames The event name or array of event names to dispatch.
     * @param data The data payload to pass to the listeners.
     * @returns A promise that resolves to an array of results from listeners.
     */
    asyncDispatch(eventNames, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const events = Array.isArray(eventNames) ?
                eventNames :
                [eventNames];
            const allResults = [];
            for (const event of events) {
                const eventKey = String(event);
                const { dynamicHandlers, metaCallbacks } = this._getHandlersForEvent(eventKey);
                // Execute dynamic handlers
                const dynamicPromises = dynamicHandlers === null || dynamicHandlers === void 0 ? void 0 : dynamicHandlers.map(handler => this._executeAsyncHandler(handler, data, eventKey));
                // Execute metadata handlers
                const metaPromises = metaCallbacks === null || metaCallbacks === void 0 ? void 0 : metaCallbacks.map(fn => this._executeAsyncMetaHandler(fn, data, eventKey));
                // Await all results
                const dynamicResults = yield Promise.all(dynamicPromises);
                const metaResults = yield Promise.all(metaPromises);
                allResults.push(...dynamicResults, ...metaResults);
            }
            // Filter out any empty/undefined results
            return allResults.filter(r => !(0, utils_1.isEmpty)(r));
        });
    }
    // -------------------------------------------------------------------------
    // Public API: Utilities
    // -------------------------------------------------------------------------
    /**
     * Gets a summary of all active listeners.
     * @returns A record where keys are event names and values are the listener count.
     */
    getActiveListeners() {
        const summary = {};
        for (const key in this._handlers) {
            if (this._handlers[key].length > 0) {
                summary[key] = this._handlers[key].length;
            }
        }
        return summary;
    }
    // -------------------------------------------------------------------------
    // Private Helpers: Dispatch Logic
    // -------------------------------------------------------------------------
    /**
     * Gets all dynamic and metadata-based handlers for a given event.
     * @returns A copy of dynamic handlers and a list of metadata callbacks.
     */
    _getHandlersForEvent(event) {
        // Get dynamic handlers (create a copy to prevent mutation during iteration)
        const dynamicHandlers = [...(this._handlers[event] || [])];
        const metaCallbacks = [];
        // Safely get handlers from metadata registry, if it exists
        if (this._metadataRegistry) {
            const metaHandlers = this._metadataRegistry.findAllEventsHandlersByEventName(event);
            // Extract the callback functions from the nested metadata structure
            for (const classMethods of Object.values(metaHandlers)) {
                for (const eventMap of Object.values(classMethods)) {
                    const fn = eventMap[event];
                    if (typeof fn === "function") {
                        metaCallbacks.push(fn);
                    }
                }
            }
        }
        return {
            dynamicHandlers,
            metaCallbacks
        };
    }
    /**
     * Safely executes a single dynamic handler synchronously.
     */
    _executeHandler(handler, data, event) {
        try {
            const result = handler.callback(data);
            if (handler.once) {
                this._removeOnceHandler(event, handler);
            }
            return result;
        }
        catch (e) {
            console.error(`Error in handler for event "${event}":`, e);
            return undefined;
        }
    }
    /**
     * Safely executes a single metadata handler synchronously.
     */
    _executeMetaHandler(fn, data, event) {
        try {
            return fn(data);
        }
        catch (e) {
            console.error(`Error in metadata handler for event "${event}":`, e);
            return undefined;
        }
    }
    /**
     * Safely executes a single dynamic handler asynchronously.
     */
    _executeAsyncHandler(handler, data, event) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield handler.callback(data);
                if (handler.once) {
                    this._removeOnceHandler(event, handler);
                }
                return result;
            }
            catch (e) {
                console.error(`Error in async handler for event "${event}":`, e);
                return undefined;
            }
        });
    }
    /**
     * Safely executes a single metadata handler asynchronously.
     */
    _executeAsyncMetaHandler(fn, data, event) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                return yield fn(data);
            }
            catch (e) {
                console.error(`Error in async metadata handler for event "${event}":`, e);
                return undefined;
            }
        });
    }
    /**
     * Removes a specific "once" handler from the internal handlers list.
     */
    _removeOnceHandler(event, handler) {
        if (!this._handlers[event]) {
            return;
        }
        this._handlers[event] = this._handlers[event].filter(h => h !== handler);
    }
    // -------------------------------------------------------------------------
    // Private Helpers: Filtering
    // -------------------------------------------------------------------------
    /**
     * Filters the handlers list for a *single* event based on a predicate.
     */
    _filterEventHandlers(event, predicate) {
        const eventKey = String(event);
        if (!this._handlers[eventKey]) {
            return;
        }
        this._handlers[eventKey] = this._handlers[eventKey].filter(predicate);
    }
    /**
     * Filters the handlers list across *all* events based on a predicate.
     */
    _filterHandlers(predicate) {
        for (const key in this._handlers) {
            this._handlers[key] = this._handlers[key].filter(predicate);
            // Clean up empty event arrays
            if (this._handlers[key].length === 0) {
                delete this._handlers[key];
            }
        }
    }
};
exports.EventDispatching = EventDispatching;
exports.EventDispatching = EventDispatching = tslib_1.__decorate([
    (0, inversify_1.injectable)(),
    tslib_1.__param(0, (0, inversify_1.inject)(Types_1.TYPES.MetadataRegistry)),
    tslib_1.__metadata("design:paramtypes", [MetadataRegistry_1.MetadataRegistry])
], EventDispatching);
//# sourceMappingURL=EventDispatching.js.map