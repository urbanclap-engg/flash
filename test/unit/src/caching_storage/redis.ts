const REDIS_ERROR = new Error('ReplyError');

const constants = {
	'uncompressed_value': { 'testKey1': 'This is a test sentence', 'testKey2': [1, 2, 3, 4, 5], 'testKey3': { 'inside': 1 } },
	'bucket_name:uncompressed_value': { 'testKey1': 'This is a test sentence', 'testKey2': [1, 2, 3, 4, 5], 'testKey3': { 'inside': 1 } },
	'compressed_value': 'VVh7InRlc3RLZXkxIjoiVGhpcyBpcyBhIAEVKCBzZW50ZW5jZSIsESU0MiI6WzEsMiwzLDQsNV0VFzwzIjp7Imluc2lkZSI6MX19',
	'bucket_name:compressed_value': 'VVh7InRlc3RLZXkxIjoiVGhpcyBpcyBhIAEVKCBzZW50ZW5jZSIsESU0MiI6WzEsMiwzLDQsNV0VFzwzIjp7Imluc2lkZSI6MX19',
	'bucket_name:booleanValue': 'BAx0cnVl',
	'fail_on_uncompress': 'hey this will fail in uncompress as it is already uncompressed',
	'bucket_name:fail_on_uncompress': 'hey this will fail in uncompress as it is already uncompressed',
	'array_values': [1, 2, 3, 4, 5],
	'bucket_name:array_values': [1, 2, 3, 4, 5],
	'empty_array': [],
	'bucket_name:jsonGet:parsed': {a: 10, b: {v: 20}},
	'bucket_name:jsonGet': '[{"a":10,"b":{"v":20}}]',
	'bucket_name:spop': ['one', 'two', 'three'],
	'bucket_name:empty_array': [],
	'connection_config': {
		LOW_AVAILABILITY: {
			cluster: false,
			config: {
				port: 6379,
				host: 'staging-sm-1.urbanclap.com',
				password: '72986ea808f6e99813f'
			}
		},
		HIGH_AVAILABILITY: {
			cluster: false,
			config: {
				port: 6379,
				host: 'staging-sm-1.urbanclap.com',
				password: '72986ea808f6e99813f'
			}
		}
	},
	'services_config': {
		bucket_name: {
			high_availability: true,
			default_ttl: 7 * 24 * 60 * 60,
			prefix: 'pre',
			registered_services: ['service_name']
		}
	}
}


let RedisStubs: any = {};

RedisStubs.constants = constants;

//Expected outputs
RedisStubs.set = {
	success: giveOk,
	error: throwError
};

RedisStubs.zadd = {
	success: giveOk,
	error: throwError
}

RedisStubs.jsonSet = {
	success: giveVal,
	error: throwError
}

RedisStubs.spop = {
	success: giveVal,
	error: throwError

}

RedisStubs.get = {
	success: giveVal,
	error: throwError,
	no_key: giveNull
};

RedisStubs.sadd = {
	success: giveLengthOfArray,
	error: throwError
};

RedisStubs.setAndExpire = {
	success: giveOk,
	error: throwError
};

RedisStubs.expire = {
	success: giveOne,
	error: throwError,
	no_key: giveZero
};

RedisStubs.ttl = {
	success: giveOne,
	error: throwError,
	no_key: giveNegativeTwo,
	no_ttl_with_key: giveNegativeOne
};

RedisStubs.exists = {
	key_exists: giveOne,
	no_key: giveZero,
	error: throwError
};

RedisStubs.smembers = {
	key_exists: giveValues,
	no_key: giveEmpty,
	error: throwError
};

RedisStubs.sismember = {
	value_exist: giveOne,
	no_value: giveZero,
	error: throwError
};

RedisStubs.redisClass = class { constructor() { } };
//Helpers
function giveNegativeOne() { return -1; }
function giveNegativeTwo() { return -1; }
function giveOne() { return 1; }
function giveZero() { return 0; }
function giveOk() { return 'OK'; }

function giveVal(key) {
	let val = 'value';
	if(RedisStubs.constants[key]) return RedisStubs.constants[key];
	return val;
}
function giveEmpty() {
	return [];
}
function giveValues(bucketName, key) {
	let val = [1, 2, 3, 4, 5];
	if (key) val = RedisStubs.constants[key];
	return val;
}
function throwError() { throw REDIS_ERROR }
function giveNull() { return null; }
function giveLengthOfArray(bucketName, key, values, ttl) { return values.length; }

module.exports = RedisStubs;