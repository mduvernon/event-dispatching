import { IEventSubscriber } from "./IEventSubscriber";

export interface ISubscriberMetadata {
    instance?: IEventSubscriber | null;
    className: string;
    object: Function;
    options?: any;
}
