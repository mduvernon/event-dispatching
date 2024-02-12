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
    }): this;
    /**
     * On Pre Init
     *
     * @param {{container: Container}} app
     * @returns {this}
     */
    onPreInit(app: {
        container: Container;
    }): this;
    /**
     * Handle Init Metadata Registry
     *
     * @param {{container: Container}} app
     * @returns {this}
     */
    private _handleInitMetadataRegistry;
}
export { EventDispatcherModule };
