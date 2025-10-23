import 'reflect-metadata';

import { describe, it, expect, beforeEach } from 'vitest';

import {
    DECORATOR_ON_META_KEY,
    EventMetadataInterface,
    EventOptions,
    On
} from '../../src';

// helper to retrieve metadata
function getOnMetadatas(): EventMetadataInterface[] {
    return Reflect.getOwnMetadata(DECORATOR_ON_META_KEY, Reflect) || [];
}

describe('On decorator (with EventMetadataInterface)', () => {
    beforeEach(() => {
        Reflect.defineMetadata(DECORATOR_ON_META_KEY, [], Reflect);
    });

    it('registers metadata for a single event name', () => {
        class TestClass {
            @On('singleEvent')
            handler(payload: any) { }
        }

        const metas = getOnMetadatas();
        expect(metas).toHaveLength(1);
        const meta = metas[0];

        expect(meta.className).toBe('TestClass');
        expect(meta.methodName).toBe('handler');
        expect(meta.eventNames).toEqual(['singleEvent']);
        expect(meta.object).toBe(TestClass.prototype);
        expect(meta.descriptor).toHaveProperty('value');
        expect(typeof meta.descriptor.value).toBe('function');
        expect(meta.options).toBeUndefined();
    });

    it('registers metadata for multiple event names', () => {
        class MultiClass {
            @On(['e1', 'e2'])
            multi(payload: any) { }
        }

        const metas = getOnMetadatas();
        expect(metas).toHaveLength(1);
        const meta = metas[0];
        expect(meta.className).toBe('MultiClass');
        expect(meta.methodName).toBe('multi');
        expect(meta.eventNames).toEqual(['e1', 'e2']);
    });

    it('stores options when provided', () => {
        const options: EventOptions = { authRoles: ['admin', 'user'] };
        class SecureClass {
            @On('secure', options)
            secureHandler(data: any) { }
        }

        const metas = getOnMetadatas();
        expect(metas).toHaveLength(1);
        const meta = metas[0];
        expect(meta.eventNames).toEqual(['secure']);
        expect(meta.options).toBe(options);
    });

    it('accumulates metadata from multiple classes', () => {
        class A {
            @On('a') aMethod() { }
        }
        class B {
            @On('b') bMethod() { }
        }

        const metas = getOnMetadatas();
        expect(metas).toHaveLength(2);
        const names = metas.map(m => m.methodName);
        expect(names).toContain('aMethod');
        expect(names).toContain('bMethod');
    });

    it('allows same method decorated twice', () => {
        class DupClass {
            @On('x')
            @On('y')
            dup(methodArg: any) { }
        }

        const metas = getOnMetadatas();
        expect(metas).toHaveLength(2);
        const events = metas.map(m => m.eventNames[0]);
        expect(events).toContain('x');
        expect(events).toContain('y');
    });

    it('does nothing when no decorator is applied', () => {
        class Plain { }
        const metas = getOnMetadatas();
        expect(metas).toEqual([]);
    });
});
