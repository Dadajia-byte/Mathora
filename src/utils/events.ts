export const eventName = [
    'API:UN_AUTH', // 未授权（refresh token过期或者没有）
    'API:VALIDATION_ERROR', // 参数校验错误
    'API:NETWORK_ERROR', // 网络错误
    'API:BUSINESS_ERROR', // 业务逻辑错误
    'API:UNKNOWN_ERROR', // 未知错误
    'API:TIMEOUT_ERROR', // 请求超时
    'API:ANY_ERROR', // 任意错误_兜底
    'API:ABORTED' // 请求取消
] as const;

export type EventName = (typeof eventName)[number];


class EventEmiiter {
    private listeners: Record<EventName, Set<Function>> = Object.fromEntries(
        eventName.map(event => [event, new Set<Function>()])
    ) as Record<EventName, Set<Function>>;
    on(event: EventName, listener: Function) {
        this.listeners[event].add(listener);
    }
    emit(eventName: EventName, ...args: any[]) {
        this.listeners[eventName].forEach(listener => listener(...args));
    }
}

export default new EventEmiiter();