import { AsyncContainerModule, Container } from 'inversify';

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
    public async bootstrap(app: { container: Container }): Promise<this> {

        setContainer(app.container)

        const bindings = new AsyncContainerModule(async (bind) => {
            // Registry declarations
            bind<MetadataRegistry>(TYPES.MetadataRegistry)
                .to(MetadataRegistry)
                .inSingletonScope();

            // Services declarations
            bind<EventDispatcher>(TYPES.EventDispatcher)
                .to(EventDispatcher);
        });

        await app.container.loadAsync(bindings);

        await this._handleInitMetadataRegistry(app);

        return this;
    }

    /**
     * On Pre Init
     *
     * @param {{container: Container}} app
     * @returns {Promise<this>}
     */
    public async onPreInit(app: { container: Container }): Promise<this> {

        await this._handleInitMetadataRegistry(app);

        return this;
    }

    /**
     * Handle Init Metadata Registry
     *
     * @param {{container: Container}} app
     * @returns {Promise<this>}
     */
    private async _handleInitMetadataRegistry(app: { container: Container }) {
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
