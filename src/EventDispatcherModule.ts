import { ContainerModule, Container } from 'inversify';

import { TYPES } from './Resources/Types';

import { MetadataRegistry } from './Registry/MetadataRegistry';

import { EventDispatcher } from './Service/EventDispatcher';

import { setMetadataRegistry } from './Lib/metadataRegistry';

import { setContainer } from './container';

/**
 * The EventDispatcherModule
 */
class EventDispatcherModule {

    /**
     * Declare all Module Services
     *
     * @private
     */
    public bootstrap(app: { container: Container }): this {

        setContainer(app.container)

        const bindings = new ContainerModule((bind) => {
            // Registry declarations
            bind<MetadataRegistry>(TYPES.MetadataRegistry)
                .to(MetadataRegistry)
                .inSingletonScope();

            // Services declarations
            bind<EventDispatcher>(TYPES.EventDispatcher)
                .to(EventDispatcher);
        });

        app.container.load(bindings);

        this._handleInitMetadataRegistry(app);

        return this;
    }

    /**
     * On Pre Init
     *
     * @param {{container: Container}} app
     * @returns {this}
     */
    public onPreInit(app: { container: Container }): this {

        this._handleInitMetadataRegistry(app);

        return this;
    }

    /**
     * Handle Init Metadata Registry
     *
     * @param {{container: Container}} app
     * @returns {this}
     */
    private _handleInitMetadataRegistry(app: { container: Container }): this {
        // Init MetadataRegistry
        const metadataRegistry: MetadataRegistry = app.container.get<MetadataRegistry>(TYPES.MetadataRegistry);

        metadataRegistry.init({
            container: app.container
        });

        // Init MetadataRegistry to be globally accessible
        setMetadataRegistry(app.container);

        return this;
    }
}

export {
    EventDispatcherModule
};
