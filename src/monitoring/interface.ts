export enum Status  {
  SUCCESS = 'success',
  FAILURE = 'failure',
  MISS = 'miss',
}

export enum Command {
  GET_DATA = 'getData',
  SET_DATA = 'setData',
  ZADD = 'zadd',
  CHECK_IF_KEY_EXISTS = 'checkIfKeyExists',
  ADD_ARRAY_VALUES = 'addArrayValues',
  GET_ARRAY_VALUES = 'getArrayValues',
  CHECK_VALUE_IN_ARRAY = 'checkValueInArray',
  DELETE_KEY = 'deleteKey',
  SPOP = 'spop',
  JSON_SET = 'jsonSet',
  JSON_GET = 'jsonGet',
}

export interface CaptureMetricsParams {
  cacheKey: string;
  bucketName: string;
  command: string;
  status: Status;
  startTime: any;
  err?: any;
  logInfo: boolean;
  service: string;
  dataLength?: number;
}
