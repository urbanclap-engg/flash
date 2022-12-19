const response: any = {};
const TYPE = 'cache';

const errorConstants = {
	'current_service' : 'Service not registered. Please check service config and read documentation here - https://gitlab.urbanclap.com/urbanclap/flash/blob/master/README.md',
	'cache_key' : 'Cache key missing',
	'data' : 'No data or empty data input',
	'values' : 'No values or empty values provided',
	'bucket_name' : 'Bucket Name missing',
	'service_name' : 'You have not set service name',
	'authentication_fail' : 'This service is not authorized to use this bucket. Please add to env json file',
	'service_type' : 'Service type missing from config',
	'connection_config' : 'Please check your connection config',
	'connection_config_key_missing' : 'Key missing from connection config - '
};

response.error = function(err) {
	return {err_type: TYPE, err_msg: err};
};

response.errorConstants = errorConstants;

export = response;