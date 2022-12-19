import snappy from 'snappy';
const util = require('node:util');
import { FLASH_METRICS } from '../monitoring/constant';
import Error from '../error';
import { ServiceConfig } from '../interface';
import CacheResponse from '../response';

const errorConstants = CacheResponse.errorConstants;
const compressPromise: any = util.promisify(snappy.compress);
const uncompressPromise: any = util.promisify(snappy.uncompress);

const CacheUtils = {
  compress: async function (data) {
    try {
      const stringifiedData = JSON.stringify(data);
      let compressedResult = await compressPromise(stringifiedData);
      compressedResult = compressedResult.toString('base64');
      return compressedResult;
    } catch (error) {
      throw error;
    }

  },

  uncompress: async function (data) {
    try {
      if (!data) return null;
      const bufferedData = new Buffer(data, 'base64');
      let result = await uncompressPromise(bufferedData, { asBuffer: true });
      result = result.toString();
      result = JSON.parse(result);
      return result;
    }
    catch (error) {
      throw error;
    }
  },


  findMissingKey: function (inputParams) {
    let missingKey = null;
    Object.keys(inputParams).map((key) => {
      if (!inputParams[key]) {
        missingKey = key;
      }
    })
    return missingKey;
  },

  cacheKeyValidation: function (key) {
    if (key) return true;
    return false;
  },

  formCacheKey: function (userKey, bucketName) {
    if (!userKey || !bucketName) return null;
    return bucketName + ':' + userKey;
  },

  checkAndGetTtl: function (ttl, serviceConfig: ServiceConfig, bucketName) {
    return ttl ? ttl : serviceConfig[bucketName].default_ttl || -1;
  },

  authenticateBucket: function (bucketName, serviceConfig, currentService) {
    let config = serviceConfig[bucketName];
    if (config.registered_services.includes(currentService)) return true;
    return false;
  },
  validations: function (inputParams: any, currentService: string, serviceConfig: string) {

    let missingKey = CacheUtils.findMissingKey(inputParams);
    //1. missing key
    if (missingKey)
      throw new Error.UCError({
        err_type: FLASH_METRICS.CACHE.ERROR.MISSING_KEY,
        message: errorConstants.cache_key
      });

    //2. service validation
    if (!CacheUtils.authenticateBucket(inputParams.bucketName,
      serviceConfig, currentService))
      throw new Error.UCError({
        err_type: FLASH_METRICS.CACHE.ERROR.AUTHENTICATION_FAIL,
        message: errorConstants.authentication_fail
      });
  }

}

export = CacheUtils;
