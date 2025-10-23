import { describe, it, expect, beforeEach, vi } from 'vitest';

import { Container, injectable } from 'inversify';

import {
    SubscriberMetadataInterface,
    EventMetadataInterface,
    MetadataRegistry,
    EventDispatcher
} from '../src';

@injectable()
class TestSubscriber {
    public onCalled = vi.fn();
    public decoratedCalled = vi.fn();

    subscribedTo() {
        return {
            TestSubscriber: {
                onCalled: {
                    'custom.event': this.onCalled
                }
            }
        };
    }

    decoratedMethod(payload: any) {
        this.decoratedCalled(payload);
    }
}

describe('EventDispatcher + MetadataRegistry integration', () => {
    let registry: MetadataRegistry;
    let dispatcher: EventDispatcher;
    let container: Container;
    let instance: TestSubscriber;

    const createSubscriberMeta = (): SubscriberMetadataInterface => ({
        object: TestSubscriber,
        className: 'TestSubscriber',
        instance: instance, // 🔥 important fix
    });

    const createOnMeta = (obj: any): EventMetadataInterface => ({
        object: obj,
        className: 'TestSubscriber',
        methodName: 'decoratedMethod',
        eventNames: ['decorated.event']
    });

    beforeEach(() => {
        container = new Container();
        registry = new MetadataRegistry();
        registry.init({ container });

        dispatcher = new EventDispatcher(registry);

        // Create a manual instance and spy on it
        instance = new TestSubscriber();
        container.bind(TestSubscriber).toConstantValue(instance); // 🔥 important fix

    });

    it('should trigger subscribedTo handler from event', () => {
        registry.addSubscriberMetadata(createSubscriberMeta());

        dispatcher.dispatch('custom.event', { value: 42 });

        expect(instance.onCalled).toHaveBeenCalledWith({ value: 42 });
    });

    it('should trigger decorated handler from event', () => {
        registry.addSubscriberMetadata(createSubscriberMeta());
        registry.addOnMetadata(createOnMeta(instance));

        dispatcher.dispatch('decorated.event', { x: 99 });

        expect(instance.decoratedCalled).toHaveBeenCalledWith({ x: 99 });
    });

    it('should collect both subscribed and decorated handlers', () => {
        registry.addSubscriberMetadata(createSubscriberMeta());
        registry.addOnMetadata(createOnMeta(instance));

        dispatcher.dispatch(['custom.event', 'decorated.event'], { foo: 'bar' });

        expect(instance.onCalled).toHaveBeenCalledWith({ foo: 'bar' });
        expect(instance.decoratedCalled).toHaveBeenCalledWith({ foo: 'bar' });
    });

    it('should work with asyncDispatch and return results', async () => {
        instance.onCalled = vi.fn(async (data) => ({ ok: data.value * 2 }));
        instance.decoratedMethod = vi.fn(async (data) => ({ done: true }));

        registry.addSubscriberMetadata(createSubscriberMeta());
        registry.addOnMetadata(createOnMeta(instance));

        const results = await dispatcher.asyncDispatch(['custom.event', 'decorated.event'], { value: 5 });

        expect(results).toContainEqual({ ok: 10 });
        expect(results).toContainEqual({ done: true });
    });

    it('should not fail when dispatching unregistered event', () => {
        expect(() => dispatcher.dispatch('unregistered.event')).not.toThrow();
    });
});
