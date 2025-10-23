import { Container } from "inversify";

let _container: Container

export const setContainer = (container: Container) => {
    _container = container
}

export const getContainer = () => {
    if (!_container) {
        throw new Error(`Container has not been initialized !`)
    }

    return _container
}
