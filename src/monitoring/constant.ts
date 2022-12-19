const FLASH_METRICS = {
    CACHE: {
        STORE: 'flash_store',
        METRICS: {
            MISS_COUNT: 'flash_request_miss_count',
            ERROR_COUNT: 'flash_request_error_count',
            CACHE_REQUEST_DURATION: 'flash_request_duration_milliseconds',
        },
        ERROR: {
            CACHE_VALIDATION: 'cache_validation_failure',
            MISSING_KEY: 'cache_key_missing',
            AUTHENTICATION_FAIL: 'authentication_fail',
            SERVICE_NOT_REGISTERED: 'service_not_registered'
        }
    },
    ERROR: {
        METRICS_INITIALIZATION_ERROR: 'flash_metrics_initialization_error',
        METRICS_CAPTURE_ERROR: 'flash_metrics_capture_error',
        METRICS_EXPORT_ERROR: 'flash_metrics_export_error'
    }
}



const IS_MONITORING_ENABLED = (process.env.LIBRARY_MONITORING_ENABLED == 'true');

export {
    FLASH_METRICS,
    IS_MONITORING_ENABLED
}