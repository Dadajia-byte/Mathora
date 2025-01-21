import { ErrorType, AppError } from './type';

// 统一错误处理器
export function handleError(error: AppError) {
  // 根据错误类型处理
  switch (error.type) {
    case ErrorType.CONCURRENT: // 并发请求过多
      showToast('系统繁忙，请稍后再试');
      break;

    case ErrorType.AUTH: // 认证错误
      break;

    case ErrorType.NETWORK: // 网络错误
      showToast('网络连接异常，请检查网络');
      break;

    case ErrorType.BUSINESS: // 业务逻辑错误
      break;

    case ErrorType.CACHE: // 缓存相关
      console.warn('缓存相关警告:', error.message);
      break;

    default: // 未知错误
      showToast('系统错误，请联系管理员');
      console.error('未处理的错误:', error);
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


// 工具函数
function showToast(message: string) {
  // 使用你项目的 UI 库弹窗组件
  console.log('[Toast]:', message);
}

