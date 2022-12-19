import CacheStore from "../caching_storage";
import CacheUtils from "./utils";
import { captureMetrics, Monitoring } from "../monitoring";
import * as _ from "lodash";
import { Command, Status } from "../monitoring/interface";
import { CACHE_CONSTANTS } from "../constants";
import { ConnectionConfig, ServiceConfig } from "../interface";

class Cache {
  serviceConfig: any;
  currentService: any;
  cacheStore: any;

  constructor() {
    this.cacheStore = CacheStore[CACHE_CONSTANTS.CACHE_STORE_NAME];
  }

  /**
   * [This will make a connection to redis]
   * @access {public instance member}
   */
  connect = function (
    connectionConfig: ConnectionConfig,
    serviceConfig: ServiceConfig,
    clientService: string
  ) {
    this.serviceConfig = serviceConfig;
    this.cacheStore.connect(connectionConfig);
    Monitoring.initFlashMetrics(clientService);
    this.logInfo = _.get(
      serviceConfig,
      "logging_options.cache_info_level",
      true
    );
  };
  /**
   * getData [get Data from cache]
   * @param  {String} key [user defined key]
   * @return {Object}         [data]
   */
  getData = async function (bucketName: string, key: string) {
    const startTime = Date.now();
    const cacheKey = CacheUtils.formCacheKey(key, bucketName);
    let dataLength = null;
    try {
      CacheUtils.validations(
        { cacheKey, bucketName },
        this.currentService,
        this.serviceConfig
      );
      const data = await this.cacheStore.get(cacheKey);
      dataLength = data?.length;
      const uncompressedData = await CacheUtils.uncompress(data);
      if (_.isNull(uncompressedData) || _.isUndefined(uncompressedData)) {
        captureMetrics({
          bucketName,
          command: Command.GET_DATA,
          cacheKey,
          status: Status.MISS,
          service: this.currentService,
          startTime,
          logInfo: this.logInfo,
          dataLength,
        });
      } else
        captureMetrics({
          bucketName,
          command: Command.GET_DATA,
          status: Status.SUCCESS,
          cacheKey,
          service: this.currentService,
          startTime,
          logInfo: this.logInfo,
          dataLength,
        });
      return uncompressedData;
    } catch (err) {
      captureMetrics({
        bucketName,
        command: Command.GET_DATA,
        status: Status.FAILURE,
        err,
        cacheKey,
        service: this.currentService,
        startTime,
        logInfo: this.logInfo,
      });
      return CACHE_CONSTANTS.GET_FAILURE_VALUE;
    }
  };

  /**
   * setData [set data in cache]
   * @param {String} key [user defined key]
   * @param {Object} data    [user data]
   * @param {Integer} ttl     [time to live in seconds]
   */
  setData = async function (
    bucketName: string,
    key: string,
    data: any,
    ttl: number
  ) {
    const startTime = Date.now();
    const cacheKey = CacheUtils.formCacheKey(key, bucketName);
    ttl = CacheUtils.checkAndGetTtl(ttl, this.serviceConfig, bucketName);
    try {
      CacheUtils.validations(
        { cacheKey, data, bucketName },
        this.currentService,
        this.serviceConfig
      );
      const compressedData = await CacheUtils.compress(data);
      let result = null;
      if (ttl === -1)
        result = await this.cacheStore.set(cacheKey, compressedData);
      else
        result = await this.cacheStore.setAndExpire(
          cacheKey,
          compressedData,
          ttl
        );

      captureMetrics({
        bucketName,
        command: Command.SET_DATA,
        status: Status.SUCCESS,
        cacheKey,
        service: this.currentService,
        startTime,
        logInfo: this.logInfo,
      });
      return CACHE_CONSTANTS.SET_SUCCESS_VALUE;
    } catch (err) {
      captureMetrics({
        bucketName,
        command: Command.SET_DATA,
        status: Status.FAILURE,
        err,
        startTime,
        cacheKey,
        service: this.currentService,
        logInfo: this.logInfo,
      });
      return CACHE_CONSTANTS.SET_FAILURE_VALUE;
    }
  };
  /**
   * jsonSet [set JSON object]
   * @param key
   * @param {Object} data [json object]
   * @param {number} ttl  [time to live in seconds]
   * @returns
   */
  jsonSet = async function (
    bucketName: string,
    key: string,
    data: any,
    path:  string = '$',
    ttl: number
  ) {
    const startTime = Date.now();
    const cacheKey = CacheUtils.formCacheKey(key, bucketName);
    ttl = CacheUtils.checkAndGetTtl(ttl, this.serviceConfig, bucketName);
    try {
      CacheUtils.validations(
        { cacheKey, data, bucketName },
        this.currentService,
        this.serviceConfig
      );
      const stringifiedData = JSON.stringify(data);
      const result = await this.cacheStore.jsonSet(cacheKey, stringifiedData, path);
      if (ttl !== -1) {
        this.cacheStore.expire(cacheKey, ttl);
      }
      captureMetrics({
        bucketName,
        command: Command.JSON_SET,
        status: Status.SUCCESS,
        cacheKey,
        service: this.currentService,
        startTime,
        logInfo: this.logInfo,
      });
      return CACHE_CONSTANTS.SET_SUCCESS_VALUE;
    } catch (err) {
      captureMetrics({
        bucketName,
        command: Command.JSON_SET,
        status: Status.FAILURE,
        err,
        startTime,
        cacheKey,
        service: this.currentService,
        logInfo: this.logInfo,
      });
      return CACHE_CONSTANTS.SET_FAILURE_VALUE;
    }
  };
  /**
   * jsonGet   [get Json Object]
   * @param {string} key
   * @returns
   */
  jsonGet = async function (bucketName: string, key: string, path: string = '$') {
    const startTime = Date.now();
    const cacheKey = CacheUtils.formCacheKey(key, bucketName);
    try {
      CacheUtils.validations(
        { cacheKey, bucketName },
        this.currentService,
        this.serviceConfig
      );
      let result = await this.cacheStore.jsonGet(cacheKey, path);
      result = JSON.parse(result);
      if (!result) {
        captureMetrics({
          bucketName,
          command: Command.JSON_GET,
          status: Status.MISS,
          cacheKey,
          service: this.currentService,
          startTime,
          logInfo: this.logInfo,
        });
      }
      else {
        captureMetrics({
          bucketName,
          command: Command.JSON_GET,
          status: Status.SUCCESS,
          cacheKey,
          service: this.currentService,
          startTime,
          logInfo: this.logInfo,
        });
      }
      return result[0];
    } catch (err) {
      captureMetrics({
        bucketName,
        command: Command.JSON_GET,
        status: Status.FAILURE,
        err,
        startTime,
        cacheKey,
        service: this.currentService,
        logInfo: this.logInfo,
      });
      return CACHE_CONSTANTS.SET_FAILURE_VALUE;
    }
  };
  /**
   * setData [set data in cache]
   * @param {String} key [user defined key]
   * @param {any} data    [user data]
   * @param {Integer} ttl     [time to live in seconds]
   * @param {number} score     [score of the element to be inserted]
   */
  zadd = async function (
    bucketName: string,
    key: string,
    score: number,
    data: any,
    ttl: number
  ) {
    const startTime = Date.now();
    const cacheKey = CacheUtils.formCacheKey(key, bucketName);
    ttl = CacheUtils.checkAndGetTtl(ttl, this.serviceConfig, bucketName);
    try {
      CacheUtils.validations(
        { cacheKey, data, bucketName },
        this.currentService,
        this.serviceConfig
      );

      const compressedData = await CacheUtils.compress(data);
      const result = await this.cacheStore.zadd(
        cacheKey,
        score,
        compressedData
      );
      let setTTLResult = "";
      if (ttl !== -1)
        setTTLResult = await this.cacheStore.expire(cacheKey, ttl);
      captureMetrics({
        bucketName,
        command: Command.ZADD,
        status: Status.SUCCESS,
        cacheKey,
        service: this.currentService,
        startTime,
        logInfo: this.logInfo
      });
      return CACHE_CONSTANTS.SET_SUCCESS_VALUE;
    } catch (err) {
      captureMetrics({
        bucketName,
        command: Command.ZADD,
        status: Status.FAILURE,
        err,
        startTime,
        cacheKey,
        service: this.currentService,
        logInfo: this.logInfo,
      });
      return CACHE_CONSTANTS.SET_FAILURE_VALUE;
    }
  };

  /**
   * checkIfKeyExists [check key in cache]
   * @param  {String} key [user defined key]
   * @return {Boolean}         [true/false]
   */
  checkIfKeyExists = async function (bucketName: string, key: string) {
    const startTime = Date.now();
    const cacheKey = CacheUtils.formCacheKey(key, bucketName);
    try {
      CacheUtils.validations(
        { cacheKey, bucketName },
        this.currentService,
        this.serviceConfig
      );
      const result = await this.cacheStore.exists(cacheKey);
      captureMetrics({
        bucketName,
        command: Command.CHECK_IF_KEY_EXISTS,
        status: Status.SUCCESS,
        cacheKey,
        service: this.currentService,
        startTime,
        logInfo: this.logInfo,
      });
      if (!result) return false;
      return true;
    } catch (err) {
      captureMetrics({
        bucketName,
        command: Command.CHECK_IF_KEY_EXISTS,
        status: Status.FAILURE,
        err,
        startTime,
        cacheKey,
        service: this.currentService,
        logInfo: this.logInfo,
      });
      return CACHE_CONSTANTS.EXISTS_FAILURE_VALUE;
    }
  };

  /**
   * addArrayValues  [Add an array of values for a key]
   * @param {String} key [user defined key]
   * @param {Array} values  [user values]
   * @param {Integer} ttl     [time to live in seconds]
   */
  addArrayValues = async function (
    bucketName: string,
    key: string,
    values: any,
    ttl: number
  ) {
    const startTime = Date.now();
    const cacheKey = CacheUtils.formCacheKey(key, bucketName);
    try {
      let result = 0;
      CacheUtils.validations(
        { cacheKey, values, bucketName },
        this.currentService,
        this.serviceConfig
      );
      if (values.length !== 0)
        result = await this.cacheStore.sadd(cacheKey, values);
      let lengthInResponse = result;
      if (!lengthInResponse) return result;
      await this.cacheStore.expire(cacheKey, ttl);
      captureMetrics({
        bucketName,
        command: Command.ADD_ARRAY_VALUES,
        status: Status.SUCCESS,
        cacheKey,
        service: this.currentService,
        startTime,
        logInfo: this.logInfo,
      });
      return lengthInResponse;
    } catch (err) {
      captureMetrics({
        bucketName,
        command: Command.ADD_ARRAY_VALUES,
        status: Status.FAILURE,
        err,
        startTime,
        cacheKey,
        service: this.currentService,
        logInfo: this.logInfo,
      });
      return CACHE_CONSTANTS.SADD_FAILURE_VALUE;
    }
  };

  /**
   * getArrayValues [Get an Array of values for a key]
   * @param  {String} key [user defined key]
   * @return {Array}         [Array of values]
   */
  getArrayValues = async function (bucketName: string, key: string) {
    const startTime = Date.now();
    const cacheKey = CacheUtils.formCacheKey(key, bucketName);
    try {
      CacheUtils.validations(
        { cacheKey, bucketName },
        this.currentService,
        this.serviceConfig
      );
      const result = await this.cacheStore.smembers(cacheKey);
      if (!result) {
        captureMetrics({
          bucketName,
          command: Command.GET_ARRAY_VALUES,
          status: Status.MISS,
          cacheKey,
          service: this.currentService,
          startTime,
          logInfo: this.logInfo,
        });
      } else {
        captureMetrics({
          bucketName,
          command: Command.GET_ARRAY_VALUES,
          status: Status.SUCCESS,
          cacheKey,

          service: this.currentService,
          startTime,
          logInfo: this.logInfo,
        });
      }
      return result;
    } catch (err) {
      captureMetrics({
        bucketName,
        command: Command.GET_ARRAY_VALUES,
        status: Status.FAILURE,
        err,
        startTime,
        cacheKey,
        service: this.currentService,
        logInfo: this.logInfo,
      });
      return CACHE_CONSTANTS.SMEMBERS_FAILURE_VALUE;
    }
  };

  /**
   * checkValueInArray [Check a single value in an Array of values for a key]
   * @param  {String} key [user defined key]
   * @param  {String/Integer} value   [Single value]
   * @return {Boolean}         [true/false]
   */
  checkValueInArray = async function (
    bucketName: string,
    key: string,
    value: any
  ) {
    const startTime = Date.now();
    const cacheKey = CacheUtils.formCacheKey(key, bucketName);
    try {
      CacheUtils.validations(
        { cacheKey, value, bucketName },
        this.currentService,
        this.serviceConfig
      );
      const result = await this.cacheStore.sismember(cacheKey, value);
      captureMetrics({
        bucketName,
        command: Command.CHECK_VALUE_IN_ARRAY,
        status: Status.SUCCESS,
        cacheKey,
        service: this.currentService,
        startTime,
        logInfo: this.logInfo,
      });
      if (!result) return false;
      return true;
    } catch (err) {
      captureMetrics({
        bucketName,
        command: Command.CHECK_VALUE_IN_ARRAY,
        status: Status.FAILURE,
        err,
        startTime,
        cacheKey,
        service: this.currentService,
        logInfo: this.logInfo,
      });
      return CACHE_CONSTANTS.SISMEMBER_FAILURE_VALUE;
    }
  };

  /**
   * popValueInSet [Removes and return a random value from set for a key]
   * @param  {String} key [user defined key]
   * @param  {number} count   [number of elements to be popped]
   * @return {any}         [Popped values]
   */
  popValuesInSet = async function (bucketName: string, key: string, count = 1) {
    const startTime = Date.now();
    const cacheKey = CacheUtils.formCacheKey(key, bucketName);
    try {
      CacheUtils.validations(
        { cacheKey, bucketName },
        this.currentService,
        this.serviceConfig
      );
      const result = await this.cacheStore.spop(cacheKey, count);
      captureMetrics({
        bucketName,
        command: Command.SPOP,
        status: Status.SUCCESS,
        cacheKey,
        service: this.currentService,
        startTime,
        logInfo: this.logInfo,
      });
      return result;
    } catch (err) {
      captureMetrics({
        bucketName,
        command: Command.SPOP,
        status: Status.FAILURE,
        err,
        startTime,
        cacheKey,
        service: this.currentService,
        logInfo: this.logInfo,
      });
      return CACHE_CONSTANTS.SPOP_FAILURE_VALUE;
    }
  };

  /**
   * deleteKey [Delete key from cache]
   * @param  {String} key [user defined key]
   * @return {Integer}         [Number of keys deleted]
   */
  deleteKey = async function (bucketName: string, key: string) {
    const startTime = Date.now();
    const cacheKey = CacheUtils.formCacheKey(key, bucketName);
    try {
      CacheUtils.validations(
        { cacheKey, bucketName },
        this.currentService,
        this.serviceConfig
      );
      const result = await this.cacheStore.delete(cacheKey);
      captureMetrics({
        bucketName,
        command: Command.DELETE_KEY,
        status: Status.SUCCESS,
        cacheKey,
        service: this.currentService,
        startTime,
        logInfo: this.logInfo,
      });
      return result;
    } catch (err) {
      captureMetrics({
        bucketName,
        command: Command.DELETE_KEY,
        status: Status.FAILURE,
        err,
        startTime,
        cacheKey,
        service: this.currentService,
        logInfo: this.logInfo,
      });
      return CACHE_CONSTANTS.DELETE_FAILURE_VALUE;
    }
  };

  setCurrentService = function (serviceName) {
    this.currentService = serviceName;
  };

  exportMetrics = Monitoring.exportMetrics;
}

export = Cache;
