import { injectable, Container } from 'inversify';

import {
    ISubscriberMetadata,
    IEventSubscriber,
    IEventsHandler,
    IEventMetadata,
} from "../Interface";
import {
    DECORATOR_EVENT_SUBSCRIBER_META_KEY,
    DECORATOR_ON_META_KEY,
} from '../Decorator';

// Utility types
type EventMethod = (props: any) => any;
type EventsHandler = Record<string, Record<string, Record<string, EventMethod>>>;

/**
 * Registry for all controllers and actions.
 */
@injectable()
export class MetadataRegistry {

    private _container!: Container;

    private _subscribersMetadata: ISubscriberMetadata[] = [];

    private _eventsMetadata: IEventMetadata[] = [];

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
    public init(props: { container: Container }): void {
        const { container } = props;

        if (!container) {
            throw new Error('Container is required');
        }

        this._container = container;

        this._scanSubscriberDecorators();
        this._scanOnDecorators();
    }

    public clear(): void {
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
    public addSubscriberMetadata(metadata: ISubscriberMetadata): void {
        if (!this.hasSubscriberMetadata(metadata)) {
            this._subscribersMetadata.push(metadata);
        }
    }

    /**
     * hasSubscriberMetadata
     *
     * @param {ISubscriberMetadata} metadata
     */
    public hasSubscriberMetadata(metadata: ISubscriberMetadata): boolean {
        return this._subscribersMetadata.some(subscriber =>
            subscriber.object === metadata.object &&
            subscriber.className === metadata.className
        );
    }

    /**
     * addEventMetadata
     *
     * @param {IEventMetadata} metadata
     */
    public addEventMetadata(metadata: IEventMetadata): void {
        if (!this.hasEventMetadata(metadata)) {
            this._eventsMetadata.push(metadata);
        }
    }

    /**
     * hasEventMetadata
     *
     * @param {IEventMetadata} metadata
     */
    public hasEventMetadata(metadata: IEventMetadata): boolean {
        return this._eventsMetadata.some(eventMetadata =>
            eventMetadata.object === metadata.object &&
            eventMetadata.methodName === metadata.methodName
        );
    }

    // -------------------------------------------------------------------------
    // Handler Resolution
    // -------------------------------------------------------------------------

    /**
     * Returns all constructed event handlers
     */
    public getAllHandlers(): EventsHandler[] {
        return this._subscribersMetadata.map(subscriber =>
            this._buildHandlersForSubscriber(subscriber)
        );
    }

    /**
     * Finds all events handlers by event name.
     *
     *  - Finds all Events Handlers that could be executed for the same event.
     *
     * @param {string} eventName
     * @return {IEventsHandler}
     */
    public findAllEventsHandlersByEventName(eventName: string): EventsHandler {
        return this.getAllHandlers()
            .filter((handler: IEventsHandler) =>
                Object.values(handler).some(methods =>
                    Object.values(methods).some(events =>
                        Object.prototype.hasOwnProperty.call(events, eventName)
                    )
                )
            )
            .reduce((acc, cur) => Object.assign(acc, cur), {});
    }

    // -------------------------------------------------------------------------
    // Private
    // -------------------------------------------------------------------------

    /**
     * Scan Subscriber Decorators
     */
    private _scanSubscriberDecorators(): void {
        // pull the array of all classes your @event_subscriber() pushed onto Reflect
        const classes: ISubscriberMetadata[] = Reflect.getOwnMetadata(DECORATOR_EVENT_SUBSCRIBER_META_KEY, Reflect) || [];

        classes.forEach((metadata: ISubscriberMetadata) => {
            this.addSubscriberMetadata(metadata);
        });
    }

    /**
     * Scan On Decorators
     */
    private _scanOnDecorators(): void {
        // pull the array of all { target, eventNames, ... } your @on() pushed onto Reflect
        const metas: IEventMetadata[] = Reflect.getOwnMetadata(DECORATOR_ON_META_KEY, Reflect) || [];

        metas.forEach(meta => this.addEventMetadata(meta));
    }

    /**
     * Instantiate Class
     *
     * @param subscriber
     */
    private _instantiateClass(subscriber: ISubscriberMetadata): IEventSubscriber {
        if (!subscriber.instance) {
            const cls: any = subscriber.object;

            if (!cls) {
                throw new Error(`Cannot instantiate subscriber "${subscriber.className}": object is undefined`);
            }

            try {
                subscriber.instance = this._container
                    ? this._container.get<IEventSubscriber>(cls)
                    : new (cls as new () => IEventSubscriber)();
            } catch (error) {
                throw new Error(`Error instantiating class "${subscriber.className}": ${(error as Error).message}`);
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
    private _buildHandlersForSubscriber(subscriber: ISubscriberMetadata): EventsHandler {
        const instance = this._instantiateClass(subscriber);
        const handlers: EventsHandler = {};

        // If subscriber explicitly defines handlers via subscribedTo()
        if (instance.subscribedTo) {
            const definedHandlers = instance.subscribedTo();
            Object.assign(handlers, definedHandlers);
        }

        // Add decorators-based handlers
        this._eventsMetadata
            .filter(meta => (meta.object.constructor === subscriber.object))
            .forEach(meta => {
                const {
                    className,
                    methodName,
                    eventNames
                } = meta;

                if (!handlers[className]) {
                    handlers[className] = {};
                }

                if (!handlers[className][methodName]) {
                    handlers[className][methodName] = {};
                }

                eventNames.forEach((event: string) => {
                    handlers[className][methodName][event] = (props: any) => {
                        return (instance as any)[methodName](props);
                    }
                });
            });

        return handlers;
    }
}
