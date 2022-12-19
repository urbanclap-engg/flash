import RedisConnection from './connection';
import Armor from '@uc-engg/armor';
import logger from '../../logger';
import { CONSTANTS } from '../../constants';
import { ConnectionConfig } from '../../interface';
const CIRCUIT_BREAKER_OPTIONS = CONSTANTS.CIRCUIT_BREAKER_OPTIONS;
const CIRCUIT_BREAKER_KEY = CONSTANTS.CIRCUIT_BREAKER_KEY;
const Command = Armor.initCircuitBreaker();

const Redis = {
  redisConfig: null,
  redisConnection: null,
  connect: async (config: ConnectionConfig) => {
    Redis.redisConfig = config;
    Redis.redisConnection = await RedisConnection.getInstance(Redis.redisConfig);
  },
  /**
 * get data from redis
 * @param  {string} key [cache key]
 * @return {string}     [value]
 */
  get: function (key: string) {
    let params = { redisConnection: Redis.redisConnection, key: key };
    return Command.execute(CIRCUIT_BREAKER_KEY.GET, params, get, null, circuitBreakerFallback, CIRCUIT_BREAKER_OPTIONS.DEFAULT);
  },
  /**
   * set data in redis
   * @param {string} key   [cache key]
   * @param {string} value [value]
   * @return {string} ['OK' on success]
   */
  set: function (key: string, value: any) {
    let params = { redisConnection: Redis.redisConnection, key: key, value: value };
    return Command.execute(CIRCUIT_BREAKER_KEY.SET, params, set, null, circuitBreakerFallback, CIRCUIT_BREAKER_OPTIONS.DEFAULT);
  },

  setAndExpire: function (key: string, value, ttl: number = -1) {
    let params = { redisConnection: Redis.redisConnection, key: key, value: value, ttl: ttl };
    return Command.execute(CIRCUIT_BREAKER_KEY.SET, params, setAndExpire, null, circuitBreakerFallback, CIRCUIT_BREAKER_OPTIONS.DEFAULT);
  },

  /**
   * expire a key in ttl seconds
   * @param  {string} key [cache key]
   * @param  {integer} ttl [time to live]
   * @return {integer}     [1 - success, 0- fail]
   */
  expire: function (key: string, ttl: number) {
    let params = { redisConnection: Redis.redisConnection, key: key, ttl: ttl };
    return Command.execute(CIRCUIT_BREAKER_KEY.EXPIRE, params, expire, null, circuitBreakerFallback, CIRCUIT_BREAKER_OPTIONS.DEFAULT);
  },

  /**
 * Add multiple values to a set
 * @param  {string} key    [cache key]
 * @param  {array} values [Values]
 * @return {integer}        [Length of values set]
 */
  sadd: function (key: string, values: any) {
    let params = { redisConnection: Redis.redisConnection, key: key, values: values };
    return Command.execute(CIRCUIT_BREAKER_KEY.SADD, params, sadd, null, circuitBreakerFallback, CIRCUIT_BREAKER_OPTIONS.DEFAULT);
  },
  /**
   * Add specified members with given scores to sorted set
   * @param  {string} key    [cache key]
   * @param  {number} score    [score of element to insert]
   * @param  {string} values    [Values]
   */
  zadd: function (key: string, score: number, values: any) {
    let params = { redisConnection: Redis.redisConnection, key: key, score: score, values: values };
    return Command.execute(CIRCUIT_BREAKER_KEY.ZADD, params, zadd, null, circuitBreakerFallback, CIRCUIT_BREAKER_OPTIONS.DEFAULT);
  },
  /**
     * Returns elements of sorted set with score between min and max(inclusive)
     * @param  {string} key    [cache key]
     * @param  {number} start   [min]
     * @param  {number} end    [max]
     */
  zrangebyscore: function (key: string, start: number, end: number) {
    let params = { redisConnection: Redis.redisConnection, key: key, start: start, end: end };
    return Command.execute(CIRCUIT_BREAKER_KEY.ZRANGEBYSCORE, params, zrangebyscore, null, circuitBreakerFallback, CIRCUIT_BREAKER_OPTIONS.DEFAULT);
  },
  /**
     * Removes elements of sorted set with score between min and max(inclusive)
     * @param  {string} key    [cache key]
     * @param  {number} start   [min]
     * @param  {number} end    [max]
     */
  zremrangebyscore: function (key: string, min: number, max: number) {
    let params = { redisConnection: Redis.redisConnection, key: key, min: min, max: max };
    return Command.execute(CIRCUIT_BREAKER_KEY.ZREMRANGEBYSCORE, params, zremrangebyscore, null, circuitBreakerFallback, CIRCUIT_BREAKER_OPTIONS.DEFAULT);
  },
  /**
   * List all members in a set for a key
   * @param  {string} key [cache key]
   * @return {array}     [array of values]
   */
  smembers: function (key: string) {
    let params = { redisConnection: Redis.redisConnection, key: key };
    return Command.execute(CIRCUIT_BREAKER_KEY.SMEMBERS, params, smembers, null, circuitBreakerFallback, CIRCUIT_BREAKER_OPTIONS.DEFAULT);
  },

  /**
   * Check value in  a set of values for a key
   * @param  {string} key   [cache key]
   * @param  {string} value [value]
   * @return {integer}       [1 - success, 0- fail]
   */
  sismember: function (key: string, value: any) {
    let params = { redisConnection: Redis.redisConnection, key: key, value: value };
    return Command.execute(CIRCUIT_BREAKER_KEY.SISMEMBER, params, sismember, null, circuitBreakerFallback, CIRCUIT_BREAKER_OPTIONS.DEFAULT);
  },

  /**
   * check key in cache
   * @param  {string} key [cache key]
   * @return {integer}     [1 - success, 0- fail]
   */
  exists: function (key: string) {
    let params = { redisConnection: Redis.redisConnection, key: key };
    return Command.execute(CIRCUIT_BREAKER_KEY.EXISTS, params, exists, null, circuitBreakerFallback, CIRCUIT_BREAKER_OPTIONS.DEFAULT);
  },

  /**
   * Removes and return a random value from set for a key
   * @param {string} key   [cache key]
   * @param {number} count   [number of elements to be popped]
   * @return {any} [values on success]
   */
  spop: function (key: string, count: number) {
    let params = { redisConnection: Redis.redisConnection, key: key, count: count };
    return Command.execute(CIRCUIT_BREAKER_KEY.SPOP, params, spop, null, circuitBreakerFallback, CIRCUIT_BREAKER_OPTIONS.DEFAULT);
  },

  /**
   * delete key from cache
   * @param  {string} key [cache key]
   * @return {integer}     [number of keys deleted]
   */
  delete: function (key: string) {
    let params = { redisConnection: Redis.redisConnection, key: key };
    return Command.execute(CIRCUIT_BREAKER_KEY.DELETE, params, deleteKey, null, circuitBreakerFallback, CIRCUIT_BREAKER_OPTIONS.DEFAULT);
  },
  /**
   * set json object as cache
   * @param {key} 
   * @param {value}  
   * @returns 
   */

  jsonSet: function (key: string, value: string, path: string) {
    let params = { redisConnection: Redis.redisConnection, key, value, path };
    return Command.execute(CIRCUIT_BREAKER_KEY.JSONSET, params, jsonSet, null, circuitBreakerFallback, CIRCUIT_BREAKER_OPTIONS.DEFAULT)
  },
  /**
   * get json object as cache
   * @param key 
   * @returns 
   */
  jsonGet: function (key: string, path: string) {
    let params = { redisConnection: Redis.redisConnection, key: key, path };
    return Command.execute(CIRCUIT_BREAKER_KEY.JSONGET, params, jsonGet, null, circuitBreakerFallback, CIRCUIT_BREAKER_OPTIONS.DEFAULT)
  }
}

/**
 * Fallback for sendEmail call. Redis will be called whenever any error occurs.
 * @param err Redis is the error occurred in the run method call
 * @param params Array containing run method params as first object and fallback params as second object
 */
function circuitBreakerFallback(err) {
  logger.genericError({
    error_type: "circuit_breaker_fallback",
    error_stack: JSON.stringify(err.stack),
    error_message: JSON.stringify(err.message || err)
  });
  return Promise.reject({
    err_type: "circuit_breaker_fallback",
    err_stack: err.stack,
    err_message: err.message || err
  });
}

function jsonSet(params) {
  return params.redisConnection.call("JSON.SET", params.key, params.path, params.value)
}


function jsonGet(params) {
  return params.redisConnection.call("JSON.Get", params.key, params.path)
}

function get(params) {
  return params.redisConnection.get(params.key);
}

function set(params) {
  return params.redisConnection.set(params.key, params.value);
}

function setAndExpire(params) {
  return params.redisConnection.set(params.key, params.value, 'EX', params.ttl);
}

function zadd(params) {
  return params.redisConnection.zadd(params.key, params.score, params.values);
}

function zrangebyscore(params) {
  return params.redisConnection.zrangebyscore(params.key, params.start, params.end, 'withscores');
}

function zremrangebyscore(params) {
  return params.redisConnection.zremrangebyscore(params.key, params.min, params.max);
}

function expire(params) {
  return params.redisConnection.expire(params.key, params.ttl);
}

function sadd(params) {
  return params.redisConnection.sadd(params.key, params.values);
}

function smembers(params) {
  return params.redisConnection.smembers(params.key);
}

function sismember(params) {
  return params.redisConnection.sismember(params.key, params.value);
}

function exists(params) {
  return params.redisConnection.exists(params.key);
}

function spop(params) {
  return params.redisConnection.spop(params.key, params.count);
}

function deleteKey(params) {
  return params.redisConnection.del(params.key);
}


export default Redis;