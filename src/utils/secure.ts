import CryptoJS from 'crypto-js';
// import NodeRSA from 'node-rsa';
// 浏览器环境下不能用上面那个库

class Secure {
  constructor() {
    // 初始化
  }

  /**
   * 将字符串编码为Base64
   * @param encodeString 要编码的字符串
   * @returns 编码后的Base64字符串
   */
  encodeBase64(encodeString: string): string {
    try {
      return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(encodeString));
    } catch (e) {
      return '';
    }
  }

  /**
   * 将Base64字符串解码为普通字符串
   * @param decodeString 要解码的Base64字符串
   * @returns 解码后的字符串
   */
  decodeBase64(decodeString: string): string {
    try {
      return CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(decodeString));
    } catch (e) {
      return '';
    }
  }

  /**
   * 生成SHA256哈希
   * @param encodeString 要编码的字符串
   * @returns SHA256哈希值
   */
  sha256(encodeString: string): string {
    try {
      return CryptoJS.SHA256(encodeString).toString(CryptoJS.enc.Hex);
    } catch (e) {
      return '';
    }
  }

  /**
   * 生成MD5哈希
   * @param encodeString 要编码的字符串
   * @returns MD5哈希值
   */
  md5(encodeString: string): string {
    try {
      return CryptoJS.MD5(encodeString).toString(CryptoJS.enc.Hex);
    } catch (e) {
      return '';
    }
  }

  /**
   * 使用AES加密字符串
   * @param encodeString 要加密的字符串
   * @param encodeKey 加密密钥
   * @param iv 初始化向量
   * @param mode 加密模式（默认CBC）
   * @returns 加密后的字符串
   */
  encodeAES(encodeString: string, encodeKey: string, iv: string = '6cd9616beb39d4034fdebe107df9a399', mode: string = 'cbc'): string {
    let result = '';
    debugger;
    const key = CryptoJS.enc.Hex.parse(encodeKey);
    const ivParsed = CryptoJS.enc.Hex.parse(iv);
    if (mode === 'ecb') {
      result = CryptoJS.AES.encrypt(encodeString, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      }).toString();
    } else if (mode === 'cbc') {
      result = CryptoJS.AES.encrypt(encodeString, key, {
        mode: CryptoJS.mode.CBC,
        iv: ivParsed,
        padding: CryptoJS.pad.Pkcs7
      }).toString();
    }
    debugger;
    return result;
  }

  /**
   * 使用AES解密字符串
   * @param szEnStr 要解密的字符串
   * @param szKey 解密密钥
   * @param szIv 初始化向量
   * @param szMode 解密模式
   * @returns 解密后的字符串
   */
  decodeAES(szEnStr: string, szKey: string, szIv: string = '6cd9616beb39d4034fdebe107df9a399', szMode: string = 'cbc'): string {
    let szRes = '';
    const key = CryptoJS.enc.Hex.parse(szKey);
    const iv = CryptoJS.enc.Hex.parse(szIv);
    if (szMode === 'ecb') {
      szRes = CryptoJS.AES.decrypt(szEnStr, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      }).toString(CryptoJS.enc.Utf8);
    } else if (szMode === 'cbc') {
      szRes = CryptoJS.AES.decrypt(szEnStr, key, {
        mode: CryptoJS.mode.CBC,
        iv: iv,
        padding: CryptoJS.pad.Pkcs7
      }).toString(CryptoJS.enc.Utf8);
    }
    return szRes;
  }

  /**
   * 生成RSA私钥
   * @param encodeKey 编码密钥
   * @param bitLength 密钥长度（默认1024）
   * @returns RSA私钥
   */
  /* generateRSAPrivateKey(encodeKey: string, bitLength: number = 1024): NodeRSA {
    const key = new NodeRSA({ b: bitLength });
    key.importKey(encodeKey, 'pkcs1-private');
    return key;
  } */

  /**
   * 生成RSA公钥
   * @param privateKey RSA私钥
   * @returns RSA公钥
   */
  /* generateRSAPublicKey(privateKey: NodeRSA): string {
    return privateKey.exportKey('pkcs1-public');
  } */

  /**
   * 使用RSA解密字符串
   * @param decodeStr 要解密的字符串
   * @param privateKey RSA私钥
   * @returns 解密后的字符串
   */
  /* decodeRSA(decodeStr: string, privateKey: NodeRSA): string {
    return privateKey.decrypt(decodeStr, 'utf8');
  } */

  /**
   * 获取RSA密钥长度
   * @returns RSA密钥长度
   */
  getRSABits(): number {
    const aRes = window.navigator.userAgent.toLowerCase().match(/msie\s([\d.]+)/);
    return aRes && Number(aRes[1]) < 9 ? 256 : 1024;
  }

  /**
   * 密码加密
   * @param szPwd 密码
   * @param oEncodeParam 编码参数
   * @param bIrreversible 是否不可逆
   * @returns 加密后的密码
   */
  encodePwd(szPwd: string, oEncodeParam: any, bIrreversible: boolean): string {
    let szEncodeKey = '';
    if (!bIrreversible) {
      szEncodeKey = this.sha256(szPwd) + oEncodeParam.challenge;
      for (let i = 1; i < oEncodeParam.iIterate; i++) {
        szEncodeKey = this.sha256(szEncodeKey);
      }
    } else {
      szEncodeKey = this.sha256(oEncodeParam.userName + oEncodeParam.salt + szPwd);
      szEncodeKey = this.sha256(szEncodeKey + oEncodeParam.challenge);
      for (let i = 2; i < oEncodeParam.iIterate; i++) {
        szEncodeKey = this.sha256(szEncodeKey);
      }
    }
    return szEncodeKey;
  }

  // 生成随机 IV
  generateIV() {
    const iv = CryptoJS.lib.WordArray.random(16);
    return iv.toString();
  };
}

export default new Secure();