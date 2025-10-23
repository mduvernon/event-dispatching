"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventDispatchingModule = void 0;
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Types_1 = require("./Resources/Types");
const MetadataRegistry_1 = require("./Registry/MetadataRegistry");
const EventDispatching_1 = require("./Service/EventDispatching");
const container_1 = require("./container");
/**
 * The EventDispatchingModule
 */
class EventDispatchingModule {
    /**
     * Get the singleton instance of the EventDispatchingModule
     *
     * @returns {EventDispatchingModule}
     */
    static getInstance() {
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
    bootstrap(app) {
        (0, container_1.setContainer)(app.container);
        const bindings = new inversify_1.ContainerModule((options) => {
            // Registry declarations
            options.bind(Types_1.TYPES.MetadataRegistry)
                .to(MetadataRegistry_1.MetadataRegistry)
                .inSingletonScope();
            // Services declarations
            options.bind(Types_1.TYPES.EventDispatching)
                .to(EventDispatching_1.EventDispatching);
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
    onPreInit(app) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this._handleInitMetadataRegistry(app);
            return this;
        });
    }
    /**
     * Handle Init Metadata Registry
     *
     * @param {{container: Container}} app
     * @returns {Promise<this>}
     */
    _handleInitMetadataRegistry(app) {
        // Init MetadataRegistry
        const metadataRegistry = app.container.get(Types_1.TYPES.MetadataRegistry);
        metadataRegistry.init({ container: app.container });
        return this;
    }
}
exports.EventDispatchingModule = EventDispatchingModule;
//# sourceMappingURL=EventDispatchingModule.js.map