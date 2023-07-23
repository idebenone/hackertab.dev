import { AxiosRequestConfig } from 'axios'
import { API_ENDPOINT } from 'src/config'
import { getBrowserName, isProduction, isWebOrExtensionVersion } from 'src/utils/Environment'
import { getAppVersion } from 'src/utils/Os'

export function DefaultRequestInterceptor(config: AxiosRequestConfig) {
  if (config) {
    config.baseURL = isProduction() ? API_ENDPOINT : '/api'
    if (config.headers) {
      config.headers.Accept = 'application/json'
      config.headers['App-Version'] = getAppVersion() || '0.0.0'
      config.headers['App-Platform'] = isWebOrExtensionVersion()
      config.headers['Browser-Name'] = getBrowserName()
    }
  }

  return config
}
