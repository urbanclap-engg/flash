## Flash - A generic caching layer
Cache is a high-speed data storage layer that stores a subset of data, typically transient, so that future requests for that data are served up faster than is possible by accessing the data’s primary storage location. Caching allows you to reuse previously retrieved or computed data efficiently. It is very tedious to onboard cache into service, and a lot of boilerplate code and configuration are needed. 
We have an out-of-the-box caching solution, i.e. Flash, a library using Redis for in-memory central storage. It is built over `ioredis` so that services can onboard cache quickly and conveniently without writing boilerplate code. 
### Installation
`Flash` is currently published at npm registry as  `@uc-engg/flash`, so to install it you need to set the registry as [NPM](https://registry.npmjs.org/) and install flash.
```
npm set registry https://registry.npmjs.org/
npm get registry      // to list the set registry
npm install @uc-engg/flash
```
### Usage
There are two ways to onboard Flash in your service 
1. By using [*MARC*](https://urbanclap-engg.github.io/marc/#/)
2. Without using [*MARC*](https://urbanclap-engg.github.io/marc/#/)



#### Steps to Onboard cache into services with using Marc
It is integrated in [Marc](https://urbanclap-engg.github.io/marc/#/) as one of the dependencies like Internal service, mysql, mongo etc. which is declared in 

```
/configs/dependency.config.js
```
##### Step 1 
Declare Cache as dependency type in dependency.config.json under `service` or `workflow`
block 
```
[DEPENDENCY.TYPE.CACHE]: [{
        id     : DEPENDENCY.ID.cache,
        options: {}
  }]
 ```
 Each type has a particular syntax it follows, for cache both id and options is required 

**Add [@uc-engg/flash]() dependency in the service package.json file**

##### Step 2
Populate the options field with **buckets** configurations.  
```
[DEPENDENCY.TYPE.CACHE]: [{
        id     : DEPENDENCY.ID.cache,
        options: {
          "bucketA": {
            "high_availability": true,
            "default_ttl": 86400,
            "registered_services": ["serviceA", "serviceB"]
          }
        }
  }]
```

1. **high_availability** - Its a boolean value and is true which refers to `HIGH_AVAILABILITY` cluster 
2. **default_ttl** - If you didn't specify `ttl(Time to Live)` during setting of cache value then this vlaue is picked by default and is in `seconds`
3. **registered_services** - List of service_ids that are allowed to do an operation on a bucket 

### Steps to Onboard cache into services without using Marc

##### Step 1 


We have to create a config file with configs for initialising `redis connection` 
1. **connectionConfigs**
```	
  HIGH_AVAILABILITY: {
    config,
    default_options,
    cluster
  },
```
`config` - Connection config host, port where you want to host your cache

`default_options` - Default options for creating redis connection 

`cluster` - Whether you want normal connection or cluster connection (boolean)

**For Example**
```
      "HIGH_AVAILABILITY": {
        "config": [
          {
            "host": "elasticache-cluster.cache.amazonaws.com",
            "port": 9002
          }
        ],
        "default_options": {
          "enableOfflineQueue": false
        },
        "cluster": true
      },
```
2. **serviceConfig**
```
"bucketA": {
	"high_availability": true,
	"default_ttl": 86400,
	"registered_services": ["serviceA", "serviceB"]
}
         
```
`high_availability` - Its a boolean value and is true which refers to HIGH_AVAILABILITY cluster

`default_ttl` - If you didn't specify ttl(Time to Live) during setting of cache value then this vlaue is picked by default and is in seconds

`registered_services` - List of service_ids that are allowed to do an operation on a bucket
 
##### Step 2

**Add [@uc-engg/flash]() dependency in the service package.json file**
Initialize Cache 
```js
import Flash from '@uc-engg/flash'

const Cache = new Flash();
Cache.connect(connectionConfig, serviceConfig, serviceName)	//connectionConfig, serviceConfig initialized in step 1 
```
Now you can start using flash Library

#### Current methods
```js
  //To set data in Cache
	Cache.setData(serviceName, key, data, ttl)
    .then(function(result){
      console.log(result);
    });

  //To get data from Cache
  Cache.getData(serviceName, key) //returns object
    .then(function(data){
      console.log('Your data is', data);
    });
  
  //Check if key exists in Cache
  Cache.checkIfKeyExists(serviceName, key) //returns true/false
    .then(function(exists){
      console.log('Your key exists', exists);
    })

  //To set an array of values in Cache for a key
  Cache.setArrayValues(serviceName, key, values, ttl)
    .then(function(result){
      console.log(result);
    });

  //To get all values of array for a key
  Cache.getArrayValues(serviceName, key)
    .then(function(values){
      console.log(values);
    });
    // Add specified members with given scores to sorted set
    Cache.zadd(bucketName, key, score, data, ttl)
      .then(function (values) {
        console.log(values);
      });
    // Check if value is present in an array
    Cache.checkValueInArray(bucketName, key, value)
      .then(function (values) {
        console.log(values);
      });
    // Delete key from cache
    Cache.deleteKey(bucketName, key)
      .then(function (values) {
        console.log(values);
      });

```

#### Steps to use JSON data type in cache
```js
// Set Json object as cache
    Cache.jsonSet(bucketName, key, data, path, ttl)
      .then(function (values) {
        console.log(values);
      });
    // Get json object as cache
    Cache.jsonGet(bucketName, key, path)  
      .then(function (values) {
        console.log(values);
      });
```
Here path refers to the depth at which you wish to store or retrieve data
```js
    // {f1: 5, f2: {a : 10}} stored at "userKey"
    Cache.jsonSet(bucketName, "userKey", {f1: 5, f2: {a : 10}} , '$') 
    
    // {f1: 5, f2: {a : 10}} will become  {f1: 5, f2: {c: {a: 10}}
    Cache.jsonSet(bucketName, "userKey", {a: {c: 10}} , '$..f2') 
    
    // Same for jsonGet 
    
    // will return what is stored at key f2 {c: {a: 10}}
    Cache.jsonSet(bucketName, "userKey", '$..f2') 
```