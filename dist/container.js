"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContainer = exports.setContainer = void 0;
let _container;
const setContainer = (container) => {
    _container = container;
};
exports.setContainer = setContainer;
const getContainer = () => {
    if (!_container) {
        throw new Error(`Container has not been initialized !`);
    }
    return _container;
};
exports.getContainer = getContainer;
//# sourceMappingURL=container.js.map