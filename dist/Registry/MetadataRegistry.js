"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetadataRegistry = void 0;
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Decorator_1 = require("../Decorator");
/**
 * Registry for all controllers and actions.
 */
let MetadataRegistry = class MetadataRegistry {
    constructor() {
        this._subscribersMetadata = [];
        this._eventsMetadata = [];
    }
    // -------------------------------------------------------------------------
    // Initialization
    // -------------------------------------------------------------------------
    /**
     * Initializes the registry with a container.
     *
     * - Init sets a container that can be used in subscribers. This allows you to inject container services into
     *  subscribers.
     *
     * @param {Container} props.container
     * @throws {Error} If container is not provided.
     * @returns {void}
     */
    init(props) {
        const { container } = props;
        if (!container) {
            throw new Error("Container is required");
        }
        this._container = container;
        this._scanSubscriberDecorators();
        this._scanOnDecorators();
    }
    clear() {
        this._subscribersMetadata = [];
        this._eventsMetadata = [];
    }
    // -------------------------------------------------------------------------
    // Public Metadata Management
    // -------------------------------------------------------------------------
    /**
     * addSubscriberMetadata
     *
     * @param {ISubscriberMetadata} metadata
     */
    addSubscriberMetadata(metadata) {
        if (!this.hasSubscriberMetadata(metadata)) {
            this._subscribersMetadata.push(metadata);
        }
    }
    /**
     * hasSubscriberMetadata
     *
     * @param {ISubscriberMetadata} metadata
     */
    hasSubscriberMetadata(metadata) {
        return this._subscribersMetadata.some(subscriber => subscriber.object === metadata.object &&
            subscriber.className === metadata.className);
    }
    /**
     * addEventMetadata
     *
     * @param {IEventMetadata} metadata
     */
    addEventMetadata(metadata) {
        if (!this.hasEventMetadata(metadata)) {
            this._eventsMetadata.push(metadata);
        }
    }
    /**
     * hasEventMetadata
     *
     * @param {IEventMetadata} metadata
     */
    hasEventMetadata(metadata) {
        return this._eventsMetadata.some(eventMetadata => eventMetadata.object === metadata.object &&
            eventMetadata.methodName === metadata.methodName);
    }
    // -------------------------------------------------------------------------
    // Handler Resolution
    // -------------------------------------------------------------------------
    /**
     * Returns all constructed event handlers
     */
    getAllHandlers() {
        return this._subscribersMetadata.map(subscriber => this._buildHandlersForSubscriber(subscriber));
    }
    /**
     * Finds all events handlers by event name.
     *
     *  - Finds all Events Handlers that could be executed for the same event.
     *
     * @param {string} eventName
     * @return {IEventsHandler}
     */
    findAllEventsHandlersByEventName(eventName) {
        return this.getAllHandlers()
            .filter((handler) => Object.values(handler).some(methods => Object.values(methods).some(events => Object.prototype.hasOwnProperty.call(events, eventName))))
            .reduce((acc, cur) => Object.assign(acc, cur), {});
    }
    // -------------------------------------------------------------------------
    // Private
    // -------------------------------------------------------------------------
    /**
     * Scan Subscriber Decorators
     */
    _scanSubscriberDecorators() {
        // pull the array of all classes your @event_subscriber() pushed onto Reflect
        const classes = Reflect.getOwnMetadata(Decorator_1.DECORATOR_EVENT_SUBSCRIBER_META_KEY, Reflect) || [];
        classes.forEach((metadata) => {
            this.addSubscriberMetadata(metadata);
        });
    }
    /**
     * Scan On Decorators
     */
    _scanOnDecorators() {
        // pull the array of all { target, eventNames, ... } your @on() pushed onto Reflect
        const metas = Reflect.getOwnMetadata(Decorator_1.DECORATOR_ON_META_KEY, Reflect) || [];
        metas.forEach(meta => this.addEventMetadata(meta));
    }
    /**
     * Instantiate Class
     *
     * @param subscriber
     */
    _instantiateClass(subscriber) {
        if (!subscriber.instance) {
            const cls = subscriber.object;
            if (!cls) {
                throw new Error(`Cannot instantiate subscriber "${subscriber.className}": object is undefined`);
            }
            try {
                subscriber.instance = this._container
                    ? this._container.get(cls)
                    : new cls();
            }
            catch (error) {
                throw new Error(`Error instantiating class "${subscriber.className}": ${error.message}`);
            }
        }
        return subscriber.instance;
    }
    /**
     * Builds handlers for a given subscriber.
     *
     * - Instantiates the subscriber class and collects all event handlers defined
     *   via `subscribedTo()` method and decorators.
     *
     * @param {ISubscriberMetadata} subscriber
     * @returns {EventsHandler}
     */
    _buildHandlersForSubscriber(subscriber) {
        const instance = this._instantiateClass(subscriber);
        const handlers = {};
        // If subscriber explicitly defines handlers via subscribedTo()
        if (instance.subscribedTo) {
            const definedHandlers = instance.subscribedTo();
            Object.assign(handlers, definedHandlers);
        }
        // Add decorators-based handlers
        this._eventsMetadata
            .filter(meta => (meta.object.constructor === subscriber.object))
            .forEach(meta => {
            const { className, methodName, eventNames } = meta;
            if (!handlers[className]) {
                handlers[className] = {};
            }
            if (!handlers[className][methodName]) {
                handlers[className][methodName] = {};
            }
            eventNames.forEach((event) => {
                handlers[className][methodName][event] = (props) => {
                    return instance[methodName](props);
                };
            });
        });
        return handlers;
    }
};
exports.MetadataRegistry = MetadataRegistry;
exports.MetadataRegistry = MetadataRegistry = tslib_1.__decorate([
    (0, inversify_1.injectable)()
], MetadataRegistry);
//# sourceMappingURL=MetadataRegistry.js.map