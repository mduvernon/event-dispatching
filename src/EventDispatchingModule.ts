import { ContainerModuleLoadOptions, ContainerModule, Container } from 'inversify';

import { TYPES } from './Resources/Types';

import { MetadataRegistry } from './Registry/MetadataRegistry';

import { EventDispatching } from './Service/EventDispatching';

import { setContainer } from './container';

/**
 * The EventDispatchingModule
 */
class EventDispatchingModule {

    /**
     * The singleton instance of the EventDispatchingModule
     */
    private static instance: EventDispatchingModule;

    /**
     * Get the singleton instance of the EventDispatchingModule
     *
     * @returns {EventDispatchingModule}
     */
    public static getInstance(): EventDispatchingModule {

        if (!EventDispatchingModule.instance) {
            EventDispatchingModule.instance = new EventDispatchingModule();
        }

        return EventDispatchingModule.instance;
    }

    /**
     * Declare all Module Services
     *
     * @private
     */
    public bootstrap(app: { container: Container }): this {

        setContainer(app.container)

        const bindings = new ContainerModule((options: ContainerModuleLoadOptions) => {
            // Registry declarations
            options.bind<MetadataRegistry>(TYPES.MetadataRegistry)
                .to(MetadataRegistry)
                .inSingletonScope();

            // Services declarations
            options.bind<EventDispatching>(TYPES.EventDispatching)
                .to(EventDispatching);
        });

        app.container.load(bindings);

        this._handleInitMetadataRegistry(app);

        return this;
    }

    /**
     * On Pre Init
     *
     * @param {{container: Container}} app
     * @returns {Promise<this>}
     */
    public async onPreInit(app: { container: Container }): Promise<this> {

        this._handleInitMetadataRegistry(app);

        return this;
    }

    /**
     * Handle Init Metadata Registry
     *
     * @param {{container: Container}} app
     * @returns {Promise<this>}
     */
    private _handleInitMetadataRegistry(app: { container: Container }): Promise<this> | this {
        // Init MetadataRegistry
        const metadataRegistry: MetadataRegistry = app.container.get<MetadataRegistry>(TYPES.MetadataRegistry);

        metadataRegistry.init({ container: app.container });

        return this;
    }
}

export { EventDispatchingModule };
