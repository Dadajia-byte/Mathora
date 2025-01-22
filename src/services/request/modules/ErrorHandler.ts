import { RequestModule,BusinessError,ErrorCode } from '../type';
import events from '@/utils/events';
export class ErrorHandler implements RequestModule {
   onError(error: BusinessError) {
    const errorMap = {
      [ErrorCode.UNAUTHORIZED]: 'API:UN_AUTH',
      [ErrorCode.VALIDATION_ERROR]: 'API:VALIDATION_ERROR',
      [ErrorCode.NETWORK_ERROR]: 'API:NETWORK_ERROR',
      [ErrorCode.BUSINESS_ERROR]: 'API:BUSINESS_ERROR',
      [ErrorCode.TIMEOUT_ERROR]: 'API:TIMEOUT_ERROR',
      [ErrorCode.UNKNOWN_ERROR]: 'API:UNKNOWN_ERROR',
      [ErrorCode.ABORTED]: 'API:ABORTED'
    } as const;

    // 发送特定错误事件
    const eventType = errorMap[error.code] || 'API:UNKNOWN_ERROR';
    events.emit(eventType, error);
    
    // 发送兜底错误事件
    events.emit('API:ANY_ERROR', error);
  }
}