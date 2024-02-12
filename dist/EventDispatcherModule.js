"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventDispatcherModule = void 0;
const inversify_1 = require("inversify");
const Types_1 = require("./Resources/Types");
const MetadataRegistry_1 = require("./Registry/MetadataRegistry");
const EventDispatcher_1 = require("./Service/EventDispatcher");
const metadataRegistry_1 = require("./Lib/metadataRegistry");
const container_1 = require("./container");
/**
 * The EventDispatcherModule
 */
class EventDispatcherModule {
    /**
     * Declare all Module Services
     *
     * @private
     */
    bootstrap(app) {
        (0, container_1.setContainer)(app.container);
        const bindings = new inversify_1.ContainerModule((bind) => {
            // Registry declarations
            bind(Types_1.TYPES.MetadataRegistry)
                .to(MetadataRegistry_1.MetadataRegistry)
                .inSingletonScope();
            // Services declarations
            bind(Types_1.TYPES.EventDispatcher)
                .to(EventDispatcher_1.EventDispatcher);
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
    onPreInit(app) {
        this._handleInitMetadataRegistry(app);
        return this;
    }
    /**
     * Handle Init Metadata Registry
     *
     * @param {{container: Container}} app
     * @returns {this}
     */
    _handleInitMetadataRegistry(app) {
        // Init MetadataRegistry
        const metadataRegistry = app.container.get(Types_1.TYPES.MetadataRegistry);
        metadataRegistry.init({
            container: app.container
        });
        // Init MetadataRegistry to be globally accessible
        (0, metadataRegistry_1.setMetadataRegistry)(app.container);
        return this;
    }
}
exports.EventDispatcherModule = EventDispatcherModule;
//# sourceMappingURL=EventDispatcherModule.js.map