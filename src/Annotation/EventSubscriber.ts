import { registryInitialized$, getMetadataRegistry } from "../Lib/metadataRegistry";

export function EventSubscriber() {

    return function (object: Function) {
        registryInitialized$.subscribe((isInitialized: boolean) => {
            if (!isInitialized) {
                return;
            }

            getMetadataRegistry().addSubscriberMetadata({
                object: object,
                className: object?.constructor?.name,
                instance: undefined,
            });
        });
    };
}
