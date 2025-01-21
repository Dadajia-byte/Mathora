import { ErrorType, AppError } from './type';
import event from '@/utils/events';
// 统一错误处理器
export function handleError(error: AppError) {
  // 根据错误类型处理
  switch (error.type) {
    case ErrorType.CONCURRENT: // 并发请求过多
      event.emit('API:CONCURRENT_ERROR');
      break;

    case ErrorType.AUTH: // 认证错误
      event.emit('API:UN_AUTH');  
      break;

    case ErrorType.NETWORK: // 网络错误
      event.emit('API:NETWORK_ERROR');
      break;

    case ErrorType.BUSINESS: // 业务逻辑错误
      event.emit('API:BUSINESS_ERROR', error);
      break;

    case ErrorType.CACHE: // 缓存相关
      event.emit('API:CACHE_ERROR');
      break;

    default: // 未知错误
      event.emit('API:UNKNOWN_ERROR', error);
  }
}

// 创建标准错误对象
export function createError(
  message: string,
  type: ErrorType,
  options: { code?: number; data?: any } = {}
): AppError {
  const error = new Error(message) as AppError;
  error.type = type;
  error.code = options.code;
  error.data = options.data;
  return error;
}

