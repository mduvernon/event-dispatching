import { describe, it, expect, beforeEach, vi } from 'vitest';

import { Container, injectable } from 'inversify';

import {
    SubscriberMetadataInterface,
    EventMetadataInterface,
    MetadataRegistry
} from '../../src';

@injectable()
class DummySubscriber {
    subscribedTo = vi.fn(() => ({
        DummyClass: {
            onDummyEvent: {
                'test.event': vi.fn()
            }
        }
    }));

    onDecorated = vi.fn();
}

describe('MetadataRegistry', () => {
    let registry: MetadataRegistry;
    let container: Container;

    const createSubscriberMetadata = (): SubscriberMetadataInterface => ({
        object: DummySubscriber,
        className: 'DummySubscriber',
        instance: null
    });

    const createOnMetadata = (subscriber: any): EventMetadataInterface => ({
        object: subscriber,
        className: 'DummySubscriber',
        methodName: 'onDecorated',
        eventNames: ['decorated.event']
    });

    beforeEach(() => {
        registry = new MetadataRegistry();
        container = new Container();
        container.bind(DummySubscriber).toSelf();
        registry.init({ container });
    });

    it('should throw if container is not passed to init', () => {
        const faulty = new MetadataRegistry();
        expect(() => faulty.init({ container: null as any })).toThrow('Container is required');
    });

    it('should add and check subscriber metadata', () => {
        const meta = createSubscriberMetadata();

        expect(registry.hasSubscriberMetadata(meta)).toBe(false);
        registry.addSubscriberMetadata(meta);
        expect(registry.hasSubscriberMetadata(meta)).toBe(true);
    });

    it('should add and check on metadata', () => {
        const dummy = new DummySubscriber();
        const meta = createOnMetadata(dummy);

        expect(registry.hasOnMetadata(meta)).toBe(false);
        registry.addOnMetadata(meta);
        expect(registry.hasOnMetadata(meta)).toBe(true);
    });

    it('should return handlers from subscribedTo()', () => {
        const meta = createSubscriberMetadata();
        registry.addSubscriberMetadata(meta);

        const handlers = registry.getAllHandlers();
        expect(handlers.length).toBe(1);
        expect(Object.keys(handlers[0])).toContain('DummyClass');
        expect(Object.keys(handlers[0]['DummyClass'])).toContain('onDummyEvent');
        expect(Object.keys(handlers[0]['DummyClass']['onDummyEvent'])).toContain('test.event');
    });

    it('should return handlers from on decorators', () => {
        const dummy = new DummySubscriber();
        const subMeta = createSubscriberMetadata();
        const onMeta = createOnMetadata(dummy);

        registry.addSubscriberMetadata(subMeta);
        registry.addOnMetadata(onMeta);

        const result = registry.getAllHandlers();

        expect(result.length).toBe(1);
        expect(result[0]['DummySubscriber']['onDecorated']['decorated.event']).toBeTypeOf('function');
    });

    it('should filter by event name using findAllEventsHandlersByEventName', () => {
        const dummy = new DummySubscriber();
        const subMeta = createSubscriberMetadata();
        const onMeta = createOnMetadata(dummy);

        registry.addSubscriberMetadata(subMeta);
        registry.addOnMetadata(onMeta);

        const result = registry.findAllEventsHandlersByEventName('decorated.event');

        expect(result['DummySubscriber']).toBeDefined();
        expect(result['DummySubscriber']['onDecorated']['decorated.event']).toBeInstanceOf(Function);
    });

    it('should return empty when no handler matches event', () => {
        const result = registry.findAllEventsHandlersByEventName('non.existent');
        expect(result).toEqual({});
    });

    it('should clear metadata registry state', () => {
        const subMeta = createSubscriberMetadata();
        const dummy = new DummySubscriber();
        const onMeta = createOnMetadata(dummy);

        registry.addSubscriberMetadata(subMeta);
        registry.addOnMetadata(onMeta);

        registry.clear();

        expect(registry.getAllHandlers().length).toBe(0);
    });

    it('should throw error if class cannot be instantiated', () => {
        const badMeta = {
            object: undefined,
            className: 'InvalidClass',
            instance: null
        };

        registry.addSubscriberMetadata(badMeta as any);

        expect(() => registry.getAllHandlers()).toThrow('Cannot instantiate subscriber');
    });
});
