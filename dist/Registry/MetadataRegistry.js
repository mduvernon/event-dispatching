"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetadataRegistry = void 0;
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
/**
 * Registry for all controllers and actions.
 */
let MetadataRegistry = class MetadataRegistry {
    constructor() {
        // -------------------------------------------------------------------------
        // Properties
        // -------------------------------------------------------------------------
        this._collectEventsHandlers = [];
        this._onMetadatas = [];
    }
    // -------------------------------------------------------------------------
    // Accessors
    // -------------------------------------------------------------------------
    /**
     * Gets all events handlers that registered here via annotations.
     */
    get collectEventsHandlers() {
        return this._collectEventsHandlers
            .reduce((handlers, subscriber) => {
            const instance = this._instantiateClass(subscriber);
            if (instance.subscribedTo) {
                handlers.push(instance.subscribedTo());
            }
            ;
            this._onMetadatas
                .filter(metadata => metadata.object.constructor === subscriber.object)
                .forEach(metadata => metadata.eventNames.map(eventName => {
                handlers.push({
                    [metadata.className]: {
                        [metadata.methodName]: {
                            [eventName]: (props) => instance[metadata.methodName](props)
                        }
                    }
                });
            }));
            return handlers;
        }, []);
    }
    // -------------------------------------------------------------------------
    // Methods
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
            throw new Error('Container is required');
        }
        this._container = container;
    }
    /**
     * addSubscriberMetadata
     *
     * @param {SubscriberMetadataInterface} metadata
     */
    addSubscriberMetadata(metadata) {
        if (!this.hasSubscriberMetadata(metadata)) {
            this._collectEventsHandlers.push(metadata);
        }
    }
    /**
     * hasSubscriberMetadata
     *
     * @param {SubscriberMetadataInterface} metadata
     */
    hasSubscriberMetadata(metadata) {
        return this._collectEventsHandlers.some(subscriber => (subscriber.object === metadata.object &&
            subscriber.className === metadata.className));
    }
    /**
     * addOnMetadata
     *
     * @param {OnMetadataInterface} metadata
     */
    addOnMetadata(metadata) {
        if (!this.hasOnMetadata(metadata)) {
            this._onMetadatas.push(metadata);
        }
    }
    /**
     * hasOnMetadata
     *
     * @param {OnMetadataInterface} metadata
     */
    hasOnMetadata(metadata) {
        return this._onMetadatas.some(onMetadata => (onMetadata.object === metadata.object &&
            onMetadata.methodName === metadata.methodName));
    }
    /**
     * Finds all events handlers by event name.
     *
     *  - Finds all Events Handlers that could be executed for the same event.
     *
     * @param {string} eventName
     * @return {EventsHandlerInterface}
     */
    findAllEventsHandlersByEventName(eventName) {
        return this.collectEventsHandlers
            .filter((handler) => {
            // Check if the event name is in the handler
            return Object.keys(handler).some(className => (Object.keys(handler[className]).some(methodName => (Object.keys(handler[className][methodName]).some(name => (name === eventName))))));
        })
            .reduce((handlers, handler) => {
            return Object.assign(Object.assign({}, handlers), handler);
        }, {});
    }
    // -------------------------------------------------------------------------
    // Private Methods
    // -------------------------------------------------------------------------
    _instantiateClass(subscriber) {
        if (!subscriber.instance) {
            const cls = subscriber.object;
            let instance = null;
            if (this._container) {
                instance = this._container.resolve(cls);
            }
            else {
                instance = new cls();
            }
            subscriber.instance = instance;
        }
        return subscriber.instance;
    }
};
exports.MetadataRegistry = MetadataRegistry;
exports.MetadataRegistry = MetadataRegistry = tslib_1.__decorate([
    (0, inversify_1.injectable)()
], MetadataRegistry);
//# sourceMappingURL=MetadataRegistry.js.map