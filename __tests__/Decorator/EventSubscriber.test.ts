import 'reflect-metadata';

import { describe, it, expect, beforeEach } from 'vitest';

import {
    DECORATOR_EVENT_SUBSCRIBER_META_KEY,
    SubscriberMetadataInterface,
    EventSubscriber,
} from '../../src';

// Helper to read metadata
function getSubscribers(): SubscriberMetadataInterface[] {
    return Reflect.getOwnMetadata(DECORATOR_EVENT_SUBSCRIBER_META_KEY, Reflect) || [];
}

describe('EventSubscriber decorator', () => {
    beforeEach(() => {
        // Clear metadata
        Reflect.defineMetadata(DECORATOR_EVENT_SUBSCRIBER_META_KEY, [], Reflect);
    });

    it('should register metadata for a class without options', () => {
        @EventSubscriber()
        class SubscriberA { }

        const subs = getSubscribers();
        expect(subs).toHaveLength(1);

        const meta = subs[0];
        expect(meta.className).toBe('SubscriberA');
        expect(meta.object).toBe(SubscriberA);
        expect(meta.instance).toBeUndefined();
        expect(meta.options).toBeUndefined();
    });

    it('should register metadata for a class with options', () => {
        const opts = { custom: true };

        @EventSubscriber(opts)
        class SubscriberB { }

        const subs = getSubscribers();
        expect(subs).toHaveLength(1);

        const meta = subs[0];
        expect(meta.className).toBe('SubscriberB');
        expect(meta.object).toBe(SubscriberB);
        expect(meta.options).toBe(opts);
    });

    it('should accumulate multiple subscribers', () => {
        @EventSubscriber()
        class First { }

        @EventSubscriber()
        class Second { }

        const subs = getSubscribers();
        const names = subs.map(s => s.className);
        expect(names).toContain('First');
        expect(names).toContain('Second');
        expect(subs).toHaveLength(2);
    });

    it('should allow duplicate registrations when applied twice', () => {
        @EventSubscriber()
        @EventSubscriber()
        class Duplicate { }

        const subs = getSubscribers();
        const duplicates = subs.filter(s => s.className === 'Duplicate');
        expect(duplicates).toHaveLength(2);
    });

    it('should not register any subscribers when no decorator is used', () => {
        class NoSub { }

        const subs = getSubscribers();
        expect(subs).toHaveLength(0);
    });
});
