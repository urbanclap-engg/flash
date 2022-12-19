import chai from 'chai';
import {CACHE_CONSTANTS} from '../../../../src/constants'
chai
  .use(require('chai-things'))
  .use(require('chai-as-promised'));
const sinon = require('sinon');
const expect = chai.expect;

const RedisStubs = require('../caching_storage/redis');
const CacheUtils = require('../../../../src/cache/utils')
let Cache = require('../../../../src/cache')
const proxyquire = require('proxyquire');
const { UCError } = require('../../../../src/error');
describe('Tests for Cache - ', function () {
  let cache, cacheStore, cacheConfig, CacheStoreStub, BUCKET_NAME;
  beforeEach(function () {
    this.sandbox = sinon.sandbox.create();
    BUCKET_NAME = 'bucket_name';
    CacheStoreStub = {};
    Cache = proxyquire('../../../../src/cache', { '../caching_storage': { 'redis': RedisStubs.redisClass, '@noCallThru': true } });
    cache = new Cache('test');
    RedisStubs.redisClass.connect = function () { };
    cache.connect(RedisStubs.constants.connection_config, RedisStubs.constants.services_config, 'service_name');
    cache.setCurrentService('service_name');
  });

  afterEach(function () {
    this.sandbox.restore();
  });

  it('Set data in redis with expire successfully', function () {
    RedisStubs.redisClass.set = RedisStubs.set.success;
    RedisStubs.redisClass.setAndExpire = RedisStubs.set.success;
    RedisStubs.redisClass.expire = RedisStubs.expire.success;
    return expect(cache.setData(BUCKET_NAME, 'key', RedisStubs.constants.uncompressed_value)).to.eventually.deep.equal('OK');
  });
  it('Throw error in setData (due to error in redis.set)', async function () {
    RedisStubs.redisClass.setAndExpire = RedisStubs.setAndExpire.error;
    expect(await cache.setData(BUCKET_NAME, 'key', RedisStubs.constants.uncompressed_value, 2)).to.equal(0);
  });

  it('Throw error in setData (due to error in compression)', async function () {
    RedisStubs.redisClass.set = RedisStubs.set.success;
    RedisStubs.redisClass.expire = RedisStubs.expire.success;
    RedisStubs.redisClass.setAndExpire = RedisStubs.setAndExpire.success;

    let ob: any = {};
    ob.a = { b: ob };


    return expect(await cache.setData(BUCKET_NAME, 'key', ob, 2)).to.equal(0);
  });

  it('Throw error in getData (due to error in redis.get)', async function () {
    RedisStubs.redisClass.get = RedisStubs.get.error;
    return expect(await cache.getData(BUCKET_NAME, 'compressed_value')).to.equal(null);
  });
  it('Get data from redis successfully', function () {
    RedisStubs.redisClass.get = RedisStubs.get.success;
    return expect(cache.getData(BUCKET_NAME, 'compressed_value')).to.eventually.deep.equal(RedisStubs.constants.uncompressed_value);
  });

  it('Get data from redis successfully with value to be boolean', async function () {
    RedisStubs.redisClass.get = RedisStubs.get.success;
    return expect(await cache.getData(BUCKET_NAME, 'booleanValue')).to.equal(true);
  });

  it('Throw error in getData (due to error in uncompress)', async function () {
    RedisStubs.redisClass.set = RedisStubs.get.success;
    return expect(await cache.getData(BUCKET_NAME, 'fail_on_compression')).to.equal(null);
  });

  it('Key exists in cache', function () {
    RedisStubs.redisClass.exists = RedisStubs.exists.key_exists;
    return expect(cache.checkIfKeyExists(BUCKET_NAME, 'key1')).to.eventually.deep.equal(true);
  });

  it('Key does not exists in cache', function () {
    RedisStubs.redisClass.exists = RedisStubs.exists.no_key;
    return expect(cache.checkIfKeyExists(BUCKET_NAME, 'key1')).to.eventually.deep.equal(false);
  });

  it('Throw error in checkIfKeyExists (due to error in redis.exists)', async function () {
    RedisStubs.redisClass.exists = RedisStubs.exists.error;
    return expect(await cache.checkIfKeyExists(BUCKET_NAME, 'key1')).to.equal(false);
  });

  it('Throw error in addArrayValues (due to error in redis.sadd)', async function () {
    RedisStubs.redisClass.sadd = RedisStubs.sadd.error;
    RedisStubs.redisClass.expire = RedisStubs.expire.success;
    return expect(await cache.addArrayValues(BUCKET_NAME, 'key1', RedisStubs.constants.array_values)).to.equal(0);
  });

  it('Get array values for a key that exists in cache', function () {
    RedisStubs.redisClass.smembers = RedisStubs.smembers.key_exists;
    return expect(cache.getArrayValues(BUCKET_NAME, 'array_values')).to.eventually.deep.equal(RedisStubs.constants.array_values);
  });

  it('Get array values for a key that doesnt exists in cache', async function () {
    RedisStubs.redisClass.smembers = RedisStubs.smembers.no_key;
    return expect(cache.getArrayValues(BUCKET_NAME, 'empty_array')).to.eventually.deep.equal(RedisStubs.constants.empty_array);
  });

  it('Value exist in array for a key', function () {
    RedisStubs.redisClass.sismember = RedisStubs.sismember.value_exist;
    return expect(cache.checkValueInArray(BUCKET_NAME, 'key', 'value')).to.eventually.deep.equal(true);
  });

  it('Value not in array for a key', function () {
    RedisStubs.redisClass.sismember = RedisStubs.sismember.no_value;
    return expect(cache.checkValueInArray(BUCKET_NAME, 'key', 'value')).to.eventually.deep.equal(false);
  });

  it('Throw error in checkValueInArray (due to error in redis.sismember)', async function () {
    RedisStubs.redisClass.sismember = RedisStubs.sismember.error;
    return expect(await cache.checkValueInArray(BUCKET_NAME, 'key', 'value')).to.equal(false);
  });

  it('firstMissingKey function working - all available', function () {
    return expect(CacheUtils.findMissingKey({ 1: 'one', 2: 'two', 3: 'three' })).to.be.equal(null);
  });

  it('firstMissingKey function working - 2 missing', function () {
    return expect(CacheUtils.findMissingKey({ 1: 'one', two: null, 3: "three" })).to.be.equal('two');
  });

  it('Adding data through zadd operation succesfully', async function () {
    RedisStubs.redisClass.zadd = RedisStubs.zadd.success;
    return expect(await cache.zadd(BUCKET_NAME, 'key1', 1 , 1, 10)).to.equal('OK');
  });
  it('Throw error in zadd (due to error in redis.zadd)', async function () {
    RedisStubs.redisClass.zadd = RedisStubs.zadd.error;
    return expect(await cache.zadd(BUCKET_NAME, 'key1', 1 , 1, 10)).to.equal(0);
  });
  it('Pop values from set successfully', async function () {
    RedisStubs.redisClass.spop = RedisStubs.spop.success;
    return expect(await cache.popValuesInSet(BUCKET_NAME, 'spop', 3 )).to.equal(RedisStubs.constants['bucket_name:spop']);
  });
  it('Throw value in popValuesInSet (due to redis.spop) ', async function () {
    RedisStubs.redisClass.spop = RedisStubs.spop.error;
    return expect(await cache.popValuesInSet(BUCKET_NAME, 'spop', 3 )).to.equal(CACHE_CONSTANTS.SPOP_FAILURE_VALUE);
  });
  it(' Set json data successfully ', async function () {
    RedisStubs.redisClass.jsonSet = RedisStubs.jsonSet.success;
    return expect(await cache.jsonSet(BUCKET_NAME, 'jsonGet', RedisStubs.constants.uncompressed_value )).to.equal('OK');
  });
  it('Throw value in jsonSet (due to redis.jsonSet) ', async function () {
    RedisStubs.redisClass.jsonSet = RedisStubs.jsonSet.error;
    return expect(await cache.jsonSet(BUCKET_NAME, 'jsonGet', RedisStubs.constants.uncompressed_value )).to.equal(0);
  });
  it('Get json data successfully ', async function () {
    RedisStubs.redisClass.jsonGet = RedisStubs.jsonSet.success;
    return expect(await cache.jsonGet(BUCKET_NAME, 'jsonGet', RedisStubs.constants.uncompressed_value )).to.deep.equal(RedisStubs.constants['bucket_name:jsonGet:parsed']);
  });
  it('Throw value in jsonSet (due to redis.jsonSet) ', async function () {
    RedisStubs.redisClass.jsonGet = RedisStubs.jsonSet.error;
    return expect(await cache.jsonGet(BUCKET_NAME, 'jsonGet', RedisStubs.constants.uncompressed_value )).to.equal(0);
  });

  
  
});

