import { Container } from 'inversify';
/**
 * The EventDispatcherModule
 */
declare class EventDispatcherModule {
    /**
     * Declare all Module Services
     *
     * @private
     */
    bootstrap(app: {
        container: Container;
    }): Promise<this>;
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
export { EventDispatcherModule };
