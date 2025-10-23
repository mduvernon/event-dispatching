import 'reflect-metadata';

import { describe, it, expect, beforeEach, vi } from 'vitest';

import {
    EventDispatcher
} from '../../src'; // adjust path

// Stub utils
vi.mock('../Lib/utils', () => ({
    isEmpty: vi.fn((v) => v == null || (Array.isArray(v) && v.length === 0)),
}));

describe('EventDispatcher', () => {
    let dispatcher: EventDispatcher;
    let registryStub: any;

    beforeEach(() => {
        registryStub = { findAllEventsHandlersByEventName: vi.fn(() => ({})) };
        dispatcher = new EventDispatcher(registryStub);
    });

    it('should register and retrieve active listeners with on()', () => {
        const cb = vi.fn();
        dispatcher.on('event1', cb);
        const active = dispatcher.getActiveListeners();
        expect(active).toEqual({ event1: 1 });
    });

    it('should execute callback on dispatch and return its result', () => {
        const cb = vi.fn((data) => 'result');
        dispatcher.on('e', cb);
        const results = dispatcher.dispatch('e', 123);
        expect(cb).toHaveBeenCalledWith(123);
        expect(results).toEqual(['result']);
    });

    it('should handle once handlers and remove after dispatch', () => {
        const cb = vi.fn(() => 'once');
        dispatcher.once('one', cb);
        // first call
        let res = dispatcher.dispatch('one');
        expect(res).toEqual(['once']);
        expect(dispatcher.getActiveListeners()).toEqual({ one: 0 });
        // second call should not invoke
        res = dispatcher.dispatch('one');
        expect(cb).toHaveBeenCalledTimes(1);
        expect(res).toEqual([]);
    });

    it('should attach multiple events and remove via remove()', () => {
        const cb = vi.fn();
        dispatcher.attach(undefined, ['a', 'b'], cb);
        expect(dispatcher.getActiveListeners()).toEqual({ a: 1, b: 1 });
        // remove by event name
        dispatcher.remove('a');
        expect(dispatcher.getActiveListeners()).toEqual({ b: 1 });
        // remove by array
        dispatcher.remove(['b']);
        expect(dispatcher.getActiveListeners()).toEqual({});
    });

    it('should detach handlers by callback', () => {
        const cb1 = vi.fn();
        const cb2 = vi.fn();
        dispatcher.on('x', cb1);
        dispatcher.on('x', cb2);
        expect(dispatcher.getActiveListeners()).toEqual({ x: 2 });
        dispatcher.detach(undefined, cb1);
        expect(dispatcher.getActiveListeners()).toEqual({ x: 1 });
        // remaining should be cb2
        dispatcher.dispatch('x');
        expect(cb2).toHaveBeenCalled();
    });

    it('should detach handlers by attachedTo', () => {
        const obj = {};
        const cb = vi.fn();
        dispatcher.attach(obj, 'ev', cb);
        dispatcher.attach(undefined, 'ev', cb);
        expect(dispatcher.getActiveListeners()).toEqual({ ev: 2 });
        dispatcher.detach(obj);
        expect(dispatcher.getActiveListeners()).toEqual({ ev: 1 });
        dispatcher.dispatch('ev');
        expect(cb).toHaveBeenCalledTimes(1);
    });

    it('should integrate metadata registry handlers in dispatch', () => {
        const registryHandler = vi.fn((d) => 'meta:' + d);
        registryStub.findAllEventsHandlersByEventName.mockReturnValue({
            TestClass: { handler: { myEvent: registryHandler } }
        });
        const res = dispatcher.dispatch('myEvent', 'data');
        expect(registryStub.findAllEventsHandlersByEventName).toHaveBeenCalledWith('myEvent');
        expect(registryHandler).toHaveBeenCalledWith('data');
        expect(res).toContain('meta:data');
    });

    it('should support asyncDispatch with async handlers', async () => {
        const cb = vi.fn(async (d) => d + 1);
        dispatcher.on('async', cb);
        const results = await dispatcher.asyncDispatch('async', 5);
        expect(cb).toHaveBeenCalledWith(5);
        expect(results).toEqual([6]);
    });

    it('should clear all handlers with detachAll()', () => {
        dispatcher.on('e', vi.fn());
        expect(dispatcher.getActiveListeners()).toEqual({ e: 1 });
        dispatcher.detachAll();
        expect(dispatcher.getActiveListeners()).toEqual({});
    });
});
