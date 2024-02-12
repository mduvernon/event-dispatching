import { injectable, Container } from 'inversify';

import { EventSubscriberInterface } from "../Interface/EventSubscriberInterface";
import { SubscriberMetadataInterface } from "../Interface/SubscriberMetadataInterface";
import { EventsHandlerInterface } from "../Interface/EventsHandlerInterface";
import { OnMetadataInterface } from "../Interface/OnMetadataInterface";

/**
 * Registry for all controllers and actions.
 */
@injectable()
export class MetadataRegistry {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    private _container: Container;

    private _collectEventsHandlers: SubscriberMetadataInterface[] = [];

    private _onMetadatas: OnMetadataInterface[] = [];

    // -------------------------------------------------------------------------
    // Accessors
    // -------------------------------------------------------------------------

    /**
     * Gets all events handlers that registered here via annotations.
     */
    get collectEventsHandlers(): EventsHandlerInterface[] {
        return this._collectEventsHandlers
            .reduce((handlers: EventsHandlerInterface[], subscriber: SubscriberMetadataInterface) => {
                const instance: EventSubscriberInterface = this._instantiateClass(subscriber);

                if (instance.subscribedTo) {
                    handlers.push(instance.subscribedTo())
                };

                this._onMetadatas
                    .filter(metadata => metadata.object.constructor === subscriber.object)
                    .forEach(metadata => metadata.eventNames.map(eventName => {
                        handlers.push({
                            [metadata.className]: {
                                [metadata.methodName]: {
                                    [eventName]: (props: any) => (<any>instance)[metadata.methodName](props)
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
    public init(props: { container: Container }): void {
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
    public addSubscriberMetadata(metadata: SubscriberMetadataInterface) {
        if (!this.hasSubscriberMetadata(metadata)) {
            this._collectEventsHandlers.push(metadata);
        }
    }

    /**
     * hasSubscriberMetadata
     *
     * @param {SubscriberMetadataInterface} metadata
     */
    public hasSubscriberMetadata(metadata: SubscriberMetadataInterface) {
        return this._collectEventsHandlers.some(subscriber => (
            subscriber.object === metadata.object &&
            subscriber.className === metadata.className
        ));
    }

    /**
     * addOnMetadata
     *
     * @param {OnMetadataInterface} metadata
     */
    public addOnMetadata(metadata: OnMetadataInterface) {
        if (!this.hasOnMetadata(metadata)) {
            this._onMetadatas.push(metadata);
        }
    }

    /**
     * hasOnMetadata
     *
     * @param {OnMetadataInterface} metadata
     */
    public hasOnMetadata(metadata: OnMetadataInterface) {
        return this._onMetadatas.some(onMetadata => (
            onMetadata.object === metadata.object &&
            onMetadata.methodName === metadata.methodName
        ));
    }

    /**
     * Finds all events handlers by event name.
     *
     *  - Finds all Events Handlers that could be executed for the same event.
     *
     * @param {string} eventName
     * @return {EventsHandlerInterface}
     */
    public findAllEventsHandlersByEventName(eventName: string): EventsHandlerInterface {
        return this.collectEventsHandlers
            .filter((handler: EventsHandlerInterface) => {
                // Check if the event name is in the handler
                return Object.keys(handler).some(className => (
                    Object.keys(handler[className]).some(methodName => (
                        Object.keys(handler[className][methodName]).some(name => (name === eventName))
                    ))
                ));
            })
            .reduce((handlers: EventsHandlerInterface, handler: EventsHandlerInterface) => {
                return { ...handlers, ...handler };
            }, {});

    }

    // -------------------------------------------------------------------------
    // Private Methods
    // -------------------------------------------------------------------------

    private _instantiateClass(subscriber: SubscriberMetadataInterface) {
        if (!subscriber.instance) {
            const cls: any = subscriber.object;

            let instance: any = null;

            if (this._container) {
                instance = this._container.resolve(cls);
            } else {
                instance = new cls();
            }

            subscriber.instance = instance;
        }

        return subscriber.instance;
    }

}
