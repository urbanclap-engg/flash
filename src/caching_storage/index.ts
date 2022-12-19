import Redis from './redis'
export = {
	redis: {
		connect: Redis.connect,
		get: Redis.get,
		set: Redis.set,
		setAndExpire: Redis.setAndExpire,
		expire: Redis.expire,
		sadd: Redis.sadd,
		zadd: Redis.zadd,
		zrangebyscore: Redis.zrangebyscore,
		zremrangebyscore: Redis.expire,
		smembers: Redis.smembers,
		sismember: Redis.sismember,
		exists: Redis.exists,
		spop: Redis.spop,
		delete: Redis.delete,
		jsonSet: Redis.jsonSet,
		jsonGet: Redis.jsonGet,
	}
}