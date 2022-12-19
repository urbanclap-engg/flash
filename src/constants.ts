export const CACHE_CONSTANTS = {
   CACHE_STORE_NAME : 'redis',
   GET_FAILURE_VALUE : null,
   SET_FAILURE_VALUE : 0,
   SET_SUCCESS_VALUE: 'OK',
   EXISTS_FAILURE_VALUE : false,
   SADD_FAILURE_VALUE : 0,
   SMEMBERS_FAILURE_VALUE : null,
   SISMEMBER_FAILURE_VALUE : false,
   SPOP_FAILURE_VALUE : [],
   DELETE_FAILURE_VALUE : 0,
   HIGH_AVAILABILITY: 'HIGH_AVAILABILITY'
}

export const CONSTANTS = {
   CIRCUIT_BREAKER_OPTIONS: {
      DEFAULT: {
          TIMEOUT: 2000,
          CIRCUIT_BREAKER_FORCE_CLOSED: true
      }
  },
  CIRCUIT_BREAKER_KEY: {
      GET: 'get',
      SET: 'set',
      SADD: 'sadd',
      ZADD: 'zadd',
      ZRANGEBYSCORE: 'zrangebyscore',
      ZREMRANGEBYSCORE: 'zremrangebyscore',
      EXPIRE: 'expire',
      SMEMBERS: 'smembers',
      SISMEMBER: 'sismember',
      EXISTS: 'exists',
      DELETE: 'delete',
      SPOP: 'spop',
      JSONSET: 'jsonset',
      JSONGET: 'jsonget'
  }
}