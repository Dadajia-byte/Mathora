import { AxiosRequestConfig, RequestModule, RequestError, TokenStorage,AxiosResponse, RequestServiceError, ErrorCode } from "../type";
export class AuthManager implements RequestModule {
  
  private tokenStorage: TokenStorage; // Token 存储实例
  private isRefreshing = false; // 是否正在刷新 Token，增加刷新锁
  private refreshQueue: Array<(token: string | null) => void> = []; // 刷新队列


  constructor(tokenStorage?: TokenStorage) {
    this.tokenStorage = tokenStorage || this.createDefaultTokenStorage();
  }

  async onRequest(config: AxiosRequestConfig): Promise<AxiosRequestConfig> {
    const accessToken = this.tokenStorage.getAccessToken();
    if (accessToken) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${accessToken}`,
      };
    }
    return config;
  }
  async onResponse(response: AxiosResponse): Promise<AxiosResponse> {
    return response;
  }

  // 生成默认的 Token 存储实例（默认都使用localStorage传递）
  createDefaultTokenStorage(): TokenStorage {
    return {
      getAccessToken: () => localStorage.getItem('access_token'),
      getRefreshToken: () => localStorage.getItem('refresh_token'),
      setTokens: (accessToken, refreshToken) => {
        localStorage.setItem('access_token', accessToken);
        refreshToken && localStorage.setItem('refresh_token', refreshToken);
      },
      clearTokens: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    }
  }

  onError(error: RequestServiceError, config?: AxiosRequestConfig){
    if (error.code === ErrorCode.UNACCESSED) {
      return this.handleUnauthorizedError(error);
    }
  };


  // 处理未授权错误
  private async handleUnauthorizedError(error: RequestError): Promise<RequestError> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      const newAccessToken = await this.refreshAccessToken();
      this.isRefreshing = false;
      this.refreshQueue.forEach((cb) => cb(newAccessToken));
      this.refreshQueue = [];
    }

    return new Promise((resolve, reject) => {
      this.refreshQueue.push(async (newToken) => {
        if (newToken) {
          error.config.headers["Authorization"] = `Bearer ${newToken}`;
          
          // ⚠️ 这里不再是 axios.request，而是 AxiosService 实例重新发起请求
          try {
            const response = await service.request(error.config);
            resolve(response);
          } catch (err) {
            reject(err);
          }
        } else {
          reject(error);
        }
      });
    });
  }

  // 刷新 Token
  private async refreshAccessToken(): Promise<string | null> {
    const refreshToken = this.tokenStorage.getRefreshToken();
    if (!refreshToken) { // 没有 refreshToken 直接返回 触发登陆过期错误
      this.tokenStorage.clearTokens();
      return Promise.reject(new RequestServiceError(ErrorCode.UNAUTHORIZED, '登陆过期，请重新登陆'));
    }

    try {
      const response = await service.post("/auth/refresh", { refreshToken });
      const { accessToken, refreshToken: newRefreshToken } = response.data;
      this.tokenStorage.setTokens(accessToken, newRefreshToken);
      return accessToken;
    } catch (err) {
      this.tokenStorage.clearTokens();
      return null;
    }
  }

}