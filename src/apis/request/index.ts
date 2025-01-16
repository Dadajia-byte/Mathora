import axios, { AxiosInstance, AxiosResponse } from "axios"
import { AxiosRequestConfig, AxiosServiceOptions } from "@/apis/request/type"
import LRUCache from "@/utils/lru"
import secure from "@/utils/secure";


class AxiosService {
  pendingRequests: Map<string, Function>;
  activeRequestsCount: number;
  maxRequestsCount: number;
  instance: AxiosInstance;
  cache: LRUCache;
  #aseKey: string;

  constructor(options:AxiosServiceOptions) {
    // 初始化请求管理队列
    this.pendingRequests = new Map();

    // 初始化最大接口数量
    this.activeRequestsCount = 0;
    this.maxRequestsCount = options.maxRequestsCount || 5;

    // 初始化实例
    this.instance = axios.create({
      baseURL: options.baseURL || process.env.VUE_APP_BASE_URL,
      timeout: options.timeout || 5000
    })

    // 初始化 LRU 缓存
    this.cache = new LRUCache({ // 这里的缓存会被刷新，不是真正意义上的C端的缓存，所以缓存时间不需要太长，容量也不需要太大
      capacity: options.capacity || 50,
      maxAge: options.maxAge || 1000 * 60 * 5
    })

    // 初始化加密密钥
    this.#aseKey = process.env.AES_KEY || 'chenanshuishandsomeboy';

    // 初始化请求拦截器
    this.instance.interceptors.request.use(
      (config: AxiosRequestConfig) => {
          // 同时请求过多拦截 
        if (this.activeRequestsCount >= this.maxRequestsCount) {
          return Promise.reject(`同时请求过多请稍后再试`)
        }

        this.removePendingRequest(config); // 移除重复请求
        this.addPendingRequest(config); // 添加请求至pengding队列

        // 缓存判断
        if (config.cache && config.url && this.cache.get(config.url)) {
          return Promise.resolve(this.cache.get(config.url))
        }

        // 加密处理
        if (config.encryption) {
          // 前端加密其实没什么用，而且耗费性能，所以一般来说还是不加密
          config = this.encryptRequest(config);
        }

        /* 使用双token判断 */
        /* const accessToken = localStorage.getItem('accessToken');


        if (accessToken) {
          config.headers['Authorization'] = `Bearer ${accessToken}`
          this.activeRequestsCount++;
          return config;
        }
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) { // 存在刷新token但是访问token不存在，则使用刷新token获取访问token
          return this.refreshToken().then(accessToken => {
            localStorage.setItem('accessToken', accessToken);
            config.headers['Authorization'] = `Bearer ${accessToken}`
            this.activeRequestsCount++;
            return config;
          }).catch(err => {
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('accessToken');
            return Promise.reject(err);
          })
        } */

        this.activeRequestsCount++;
        return config
      },
      err => Promise.reject(err)
    )

    // 相应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        this.removePendingRequest(response.config);
        // 缓存处理
        if ((response.config as AxiosRequestConfig).cache) { // 在接口中增加cache字段主动开启缓存
          this.cache.put(response.config.url!, response.data);
        }
        this.activeRequestsCount--;
        return response;
      },
      error => {
        this.removePendingRequest(error.config || {});
        this.activeRequestsCount--;
        return Promise.reject(error)
      }
    )
  }

  // 加密请求数据
  encryptRequest(config: AxiosRequestConfig): AxiosRequestConfig {
    const { method, encryptWholeMessage, encryptFields } = config.encryption!;
    let aesIV: string | undefined;
    // 目前默认如果选择AES加密，则默认就是AES的cbc模式
    if(method === 'AES') {
      aesIV = secure.generateIV();
      config.headers = config.headers || {};
      config.headers['X-AES-IV'] = aesIV; // 如果是AES的cbc模式要将iv传递给后端
    }
    if (encryptWholeMessage) { // 加密整个报文
      config.data = this.encryptData(config.data, method, aesIV);
    } else if (encryptFields && encryptFields.length > 0) { // 加密指定字段
      encryptFields.forEach(field => {
        if (config.data[field]) {
          config.data[field] = this.encryptData(config.data[field], method, aesIV);
        }
      });
    }
    return config;
  }

  // 加密数据
  encryptData(data: any, method: 'AES' | 'RSA', aesIV?:string): any {
    try {
      if (method === 'AES') {
        const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
        const encrypted = secure.encodeAES(dataStr, this.#aseKey, aesIV);
        return encrypted;
      } else if (method === 'RSA') {
        /* 暂时不做RSA加密，我还没搞得特别懂 */
      }
      return data;
    } catch (e) {
      console.error('数据加密错误:', e);
      throw e;
    }
  }

  // pending请求队列，避免重复请求
  addPendingRequest(config:AxiosRequestConfig) {
    const key = `${config.url}-${JSON.stringify(config.params || {})}-${JSON.stringify(config.data || {})}`;
    if (this.pendingRequests.has(key)) {
      config.cancelToken = new axios.CancelToken(cancel => cancel(`请求取消`))
    } else {
      config.cancelToken = new axios.CancelToken(cancel => {
        this.pendingRequests.set(key, cancel)
      });
    }
  }
  // 移除请求队列
  removePendingRequest(config:AxiosRequestConfig) {
    const key = `${config.url}-${JSON.stringify(config.params || {})}-${JSON.stringify(config.data || {})}`;
    if (this.pendingRequests.has(key)) {
      const cancel = this.pendingRequests.get(key);
      if (cancel) {
        cancel(key);
      }
      this.pendingRequests.delete(key);
    }
  }

  // 刷新获取refreshToken
  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await axios.post('/api/user/refresh', { refreshToken });
    return response.data.accessToken;
  }
}

const options = {
  baseURL: '/api',
  timeout: 5000,
  // capacity:50, // 开启缓存后，缓存数量
  // maxAge:1000*60*5 // 开启缓存后，缓存生命周期
  // maxRequestsCount:5, // 最大同时发送接口数
}

export const createRequest = (options:AxiosServiceOptions):AxiosService => {
  return new AxiosService(options)
}

export const request = createRequest(options).instance;

