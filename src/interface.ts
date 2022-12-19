export interface ServiceConfig {
  [key: string]: {
    high_availability?: boolean,
    registered_services?: Array<string>,
    default_ttl?: number
  }
}

export interface CacheConfig {
  host: string,
  port: number
}
export interface ConnectionConfig {
  HIGH_AVAILABILITY: {
    config: Array<CacheConfig>,
    default_options: Object,
    cluster: boolean
  },
  LOW_AVAILABILITY: {
    config: Array<CacheConfig>,
    default_options: Object,
    cluster: boolean
  }
}