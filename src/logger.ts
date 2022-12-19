import Logger from '@uc-engg/logging-repo';
const customLogger = Logger.initLogger(process.env.LOG_INDEX_NAME);
const LOG_TYPE = 'cache';
let logger:any = {};

logger.info = function (eventName, eventType, info, cacheKey, serviceName, responseTime, dataLength) {
  let data:any = {};
  data.key_1 = 'event_name';
  data.key_1_value = eventName;
  data.key_2 = 'event_type';
  data.key_2_value = eventType;
  data.key_3 = "info";
  data.key_3_value = (info === null || info === undefined) ? "" : info.toString();
  if (responseTime != null || responseTime != undefined) {
    data.numkey_1 = 'response_time_ms';
    data.numkey_1_value = responseTime;
  }
  if (dataLength != null || dataLength != undefined) {
    data.numkey_2 = 'data_length';
    data.numkey_2_value = dataLength;
  }
  data.log_type = LOG_TYPE;
  data.message = JSON.stringify({
    service_name: serviceName,
    cache_key: cacheKey
  });
  customLogger.info(data);
};

logger.debug = function (eventName, eventType, debugInfo, cacheKey) {
  let data: any = {};
  data.key_1 = 'event_name';
  data.key_1_value = eventName;
  data.key_2 = 'event_type';
  data.key_2_value = eventType;
  if (cacheKey){
    data.key_3 = "cache_key";
    data.key_3_value = cacheKey;
  }
  data.log_type = LOG_TYPE;
  data.message = JSON.stringify({
    info : debugInfo,
  });
  customLogger.debug(data);
};

logger.error = function (eventName, eventType, error, cacheKey, serviceName, responseTime, dataLength) {
  let data: any = {};
  data.key_1 = 'event_name';
  data.key_1_value = eventName;
  data.key_2 = 'event_type';
  data.key_2_value = eventType;
  if (cacheKey){
    data.key_3 = "cache_key";
    data.key_3_value = cacheKey;
  }
  if (responseTime != null || responseTime != undefined) {
    data.numkey_1 = 'response_time_ms';
    data.numkey_1_value = responseTime;
  }
  if (dataLength != null || dataLength != undefined) {
    data.numkey_2 = 'data_length';
    data.numkey_2_value = dataLength;
  }
  data.error_message = JSON.stringify(error);
  data.log_type = LOG_TYPE;
  data.message = JSON.stringify({
    service_name: serviceName
  });
  customLogger.error(data);
};


export default logger;