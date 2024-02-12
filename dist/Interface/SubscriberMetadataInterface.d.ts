import { EventSubscriberInterface } from "./EventSubscriberInterface";
export interface SubscriberMetadataInterface {
    object: Function;
    instance: EventSubscriberInterface;
    className: string;
}
