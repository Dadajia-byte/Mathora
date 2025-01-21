const eventName = [
    'API:UN_AUTH',
    'API:VALIDATION_ERROR',
] as const;

type EventName = (typeof eventName)[number];


class EventEmiiter {
    private listeners: Record<EventName, Set<Function>> = {
        'API:UN_AUTH': new Set(),
        'API:VALIDATION_ERROR': new Set(),
    }
    on(event: EventName, listener: Function) {
        this.listeners[event].add(listener);
    }
    emit(eventName: EventName, ...args: any[]) {
        this.listeners[eventName].forEach(listener => listener(...args));
    }
}

export const eventEmitter = new EventEmiiter();