import { Container } from "inversify";
/**
 * The EventDispatchingModule
 */
declare class EventDispatchingModule {
    /**
     * The singleton instance of the EventDispatchingModule
     */
    private static instance;
    /**
     * Get the singleton instance of the EventDispatchingModule
     *
     * @returns {EventDispatchingModule}
     */
    static getInstance(): EventDispatchingModule;
    /**
     * Declare all Module Services
     *
     * @private
     */
    bootstrap(app: {
        container: Container;
    }): this;
    /**
     * On Pre Init
     *
     * @param {{container: Container}} app
     * @returns {Promise<this>}
     */
    onPreInit(app: {
        container: Container;
    }): Promise<this>;
    /**
     * Handle Init Metadata Registry
     *
     * @param {{container: Container}} app
     * @returns {Promise<this>}
     */
    private _handleInitMetadataRegistry;
}
export { EventDispatchingModule };
