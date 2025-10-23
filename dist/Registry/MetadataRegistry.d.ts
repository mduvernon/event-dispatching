import { Container } from "inversify";
import { ISubscriberMetadata, IEventMetadata } from "../Interface";
type EventMethod = (props: any) => any;
type EventsHandler = Record<string, Record<string, Record<string, EventMethod>>>;
/**
 * Registry for all controllers and actions.
 */
export declare class MetadataRegistry {
    private _container;
    private _subscribersMetadata;
    private _eventsMetadata;
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
    init(props: {
        container: Container;
    }): void;
    clear(): void;
    /**
     * addSubscriberMetadata
     *
     * @param {ISubscriberMetadata} metadata
     */
    addSubscriberMetadata(metadata: ISubscriberMetadata): void;
    /**
     * hasSubscriberMetadata
     *
     * @param {ISubscriberMetadata} metadata
     */
    hasSubscriberMetadata(metadata: ISubscriberMetadata): boolean;
    /**
     * addEventMetadata
     *
     * @param {IEventMetadata} metadata
     */
    addEventMetadata(metadata: IEventMetadata): void;
    /**
     * hasEventMetadata
     *
     * @param {IEventMetadata} metadata
     */
    hasEventMetadata(metadata: IEventMetadata): boolean;
    /**
     * Returns all constructed event handlers
     */
    getAllHandlers(): EventsHandler[];
    /**
     * Finds all events handlers by event name.
     *
     *  - Finds all Events Handlers that could be executed for the same event.
     *
     * @param {string} eventName
     * @return {IEventsHandler}
     */
    findAllEventsHandlersByEventName(eventName: string): EventsHandler;
    /**
     * Scan Subscriber Decorators
     */
    private _scanSubscriberDecorators;
    /**
     * Scan On Decorators
     */
    private _scanOnDecorators;
    /**
     * Instantiate Class
     *
     * @param subscriber
     */
    private _instantiateClass;
    /**
     * Builds handlers for a given subscriber.
     *
     * - Instantiates the subscriber class and collects all event handlers defined
     *   via `subscribedTo()` method and decorators.
     *
     * @param {ISubscriberMetadata} subscriber
     * @returns {EventsHandler}
     */
    private _buildHandlersForSubscriber;
}
export {};
