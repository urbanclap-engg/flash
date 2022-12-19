import * as Mycroft from "@uc-engg/mycroft";
import { FLASH_METRICS, IS_MONITORING_ENABLED } from "./constant";
import logger from "../logger";
import _ from "lodash";
import { CaptureMetricsParams, Status } from "./interface";

const ERROR = FLASH_METRICS.ERROR;

let IS_STORE_CREATED = false;
export const Monitoring = {
  initFlashMetrics: function (serviceId) {
    if (!IS_MONITORING_ENABLED || IS_STORE_CREATED) return;

    IS_STORE_CREATED = true;

    const defaultLabels = {
      service: serviceId,
    };

    try {
      Mycroft.createStore({
        storeName: FLASH_METRICS.CACHE.STORE,
        defaultLabels: defaultLabels,
      });
      Mycroft.registerMetric.counter(FLASH_METRICS.CACHE.STORE, {
        name: FLASH_METRICS.CACHE.METRICS.ERROR_COUNT,
        help: "Count of cache errors",
        labelNames: ["bucket", "command", "error_type"],
      });
      Mycroft.registerMetric.histogram(FLASH_METRICS.CACHE.STORE, {
        name: FLASH_METRICS.CACHE.METRICS.CACHE_REQUEST_DURATION,
        help: "Time taken to complete request",
        labelNames: ["bucket", "command", "status"],
        buckets: [1, 3, 5, 10, 15, 20, 25, 50, 100, 1000, 60000],
      });
    } catch (err) {
      Monitoring.logError(ERROR.METRICS_INITIALIZATION_ERROR, err);
      throw err;
    }
  },
  captureCounterMetrics: function (metricName, monitoringParams) {
    if (!IS_MONITORING_ENABLED) return;
    try {
      Mycroft.incMetric(
        FLASH_METRICS.CACHE.STORE,
        metricName,
        monitoringParams
      );
    } catch (err) {
      Monitoring.logError(ERROR.METRICS_CAPTURE_ERROR, err);
    }
  },
  captureHistogramMetrics: function (metricName, monitoringParams, value) {
    if (!IS_MONITORING_ENABLED) return;
    try {
      Mycroft.setMetric(
        FLASH_METRICS.CACHE.STORE,
        metricName,
        monitoringParams,
        value
      );
    } catch (err) {
      Monitoring.logError(ERROR.METRICS_CAPTURE_ERROR, err);
    }
  },
  exportMetrics: function () {
    if (!IS_MONITORING_ENABLED) return "";
    try {
      return "\n" + Mycroft.exportMetrics(FLASH_METRICS.CACHE.STORE).metrics;
    } catch (err) {
      Monitoring.logError(ERROR.METRICS_EXPORT_ERROR, err);
    }
  },
  logError: function (type, err) {
    logger.error({
      error_type: type,
      error_message: err.message || JSON.stringify(err),
      error_stack: err.stack,
    });
  },
};


export const captureMetrics = function (params: CaptureMetricsParams) {
  const responseTime = Date.now() - params.startTime;

  Monitoring.captureHistogramMetrics(
    FLASH_METRICS.CACHE.METRICS.CACHE_REQUEST_DURATION,
    {
      bucket: params.bucketName,
      command: params.command,
      status: params.status,
    },
    responseTime
  );
  if (params.status === Status.FAILURE) {
    Monitoring.captureCounterMetrics(FLASH_METRICS.CACHE.METRICS.ERROR_COUNT, {
      bucket: params.bucketName,
      command: params.command,
      error_type: params.err.err_type || params.err.name,
    });
    if (params.logInfo)
      logger.error(
        params.bucketName,
        params.command,
        params.err.err_message || params.err.message,
        params.cacheKey,
        params.service,
        responseTime
      );
  } else {
    if (params.logInfo) {
      logger.info(
        params.bucketName,
        params.command,
        params.status,
        params.cacheKey,
        params.service,
        responseTime,
        params.dataLength
      );
    }
  }
};
