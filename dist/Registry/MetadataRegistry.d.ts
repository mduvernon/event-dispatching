import { Container } from 'inversify';
import { SubscriberMetadataInterface } from "../Interface/SubscriberMetadataInterface";
import { EventsHandlerInterface } from "../Interface/EventsHandlerInterface";
import { OnMetadataInterface } from "../Interface/OnMetadataInterface";
/**
 * Registry for all controllers and actions.
 */
export declare class MetadataRegistry {
    private _container;
    private _collectEventsHandlers;
    private _onMetadatas;
    /**
     * Gets all events handlers that registered here via annotations.
     */
    get collectEventsHandlers(): EventsHandlerInterface[];
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
    /**
     * addSubscriberMetadata
     *
     * @param {SubscriberMetadataInterface} metadata
     */
    addSubscriberMetadata(metadata: SubscriberMetadataInterface): void;
    /**
     * hasSubscriberMetadata
     *
     * @param {SubscriberMetadataInterface} metadata
     */
    hasSubscriberMetadata(metadata: SubscriberMetadataInterface): boolean;
    /**
     * addOnMetadata
     *
     * @param {OnMetadataInterface} metadata
     */
    addOnMetadata(metadata: OnMetadataInterface): void;
    /**
     * hasOnMetadata
     *
     * @param {OnMetadataInterface} metadata
     */
    hasOnMetadata(metadata: OnMetadataInterface): boolean;
    /**
     * Finds all events handlers by event name.
     *
     *  - Finds all Events Handlers that could be executed for the same event.
     *
     * @param {string} eventName
     * @return {EventsHandlerInterface}
     */
    findAllEventsHandlersByEventName(eventName: string): EventsHandlerInterface;
    private _instantiateClass;
}
