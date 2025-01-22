import event, { EventName }from '@/utils/events';
import { AppError, ErrorType, RequestModule } from '../type';

export class ErrorHandler implements RequestModule {
  private errorEventMap: Record<ErrorType, EventName> = {
    [ErrorType.AUTH]: 'API:UN_AUTH',
    [ErrorType.VALIDATION]: 'API:VALIDATION_ERROR',
    [ErrorType.NETWORK]: 'API:NETWORK_ERROR',
    [ErrorType.BUSINESS]: 'API:BUSINESS_ERROR',
    [ErrorType.CONCURRENT]: 'API:CONCURRENT_ERROR',
    [ErrorType.TIMEOUT]: 'API:TIMEOUT_ERROR',
    [ErrorType.CACHE]: 'API:CACHE_ERROR',
    [ErrorType.UNKNOWN]: 'API:UNKNOWN_ERROR'
  };

  async onError(error: AppError): Promise<void> {
    // 仅做错误转发，不包含任何处理逻辑
    const eventName = this.errorEventMap[error.type] || 'API:UNKNOWN_ERROR';
    event.emit(eventName, error);
    event.emit('API:ANY_ERROR', error);
  }
}