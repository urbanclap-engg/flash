import Redis from 'ioredis';
const RedisConnection = {
  instance: null,
  setConnection: (redisConfig) => {
    const haConfig = redisConfig.HIGH_AVAILABILITY;
    const redisConnection = RedisConnection.connectToRedis(haConfig);
    return redisConnection;
  },
  connectToRedis: async (redisConfig) => {
    if (!redisConfig) return null;
    const isClusterTrue = redisConfig.cluster || false;
    const defaultOptions = redisConfig.default_options;
    return isClusterTrue ? await RedisConnection.connectToCluster(redisConfig.config, defaultOptions)
      : await RedisConnection.connectToSingleInstance(redisConfig.config, defaultOptions);
  },
  connectToCluster: async (config, defaultOptions) => {
    if (!config) return null;
    const redisCluster = new Redis.Cluster(config, defaultOptions);
    await RedisConnection.addListeners(redisCluster);
    return redisCluster;
  },
  initConnection: async (config) => {
    const connection = config ? await RedisConnection.setConnection(config) : null;
    return connection;
  },
  addListeners: async (redis) => {
    return new Promise((resolve, reject) => {
      redis.on("ready", (ready) => {
        console.log("Redis connection is now ready");
        resolve(ready);
      });
      redis.on("connect", (connected) => {
        console.log("Redis is now connected ");
      });
      redis.on("error", (error) => {
        console.log("Redis connection error");
        reject(error);
      });
      redis.on("reconnecting", (reconnect) => {
        console.log("Redis reconnecting now");
      });
    })
  },
  getInstance: async (config) => {
    if (!RedisConnection.instance) RedisConnection.instance = await RedisConnection.initConnection(config);
    return RedisConnection.instance;
  },
  connectToSingleInstance: async (config, defaultOptions) => {
    if (!config) return null;
    const redis = new Redis(config, defaultOptions);
    await RedisConnection.addListeners(redis);
    return redis;
  }

}

export default RedisConnection;