import { RequestModule, AxiosRequestConfig } from "../type";
import secure from "@/utils/secure";

// 加密模块
export class EncryptionHandler implements RequestModule {
  constructor(private key: string) {}

  async onRequest(config: AxiosRequestConfig) {
    if (!config.encryption) return config;
    

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
  private encryptData(data: any, method: 'AES' | 'RSA', aesIV?:string): any {
      try {
        if (method === 'AES') {
          const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
          const encrypted = secure.encodeAES(dataStr, this.key, aesIV);
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
}

export default EncryptionHandler;