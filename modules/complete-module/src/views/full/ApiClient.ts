import { AxiosRequestConfig, AxiosStatic } from 'axios'

const MODULE_URL_PREFIX = '/mod/complete-module'

class ApiClient {
  constructor(private axios: AxiosStatic) { }

  async get(url: string, config?: AxiosRequestConfig) {
    const res = await this.axios.get(url, config)
    return res.data
  }

  getForModule(url: string, config?: AxiosRequestConfig) {
    return this.get(MODULE_URL_PREFIX + url, config)
  }

  getCountById(id: number) {
    return this.getForModule(`/count/${id}`)
  }

  getCount() {
    return this.getForModule('/getRawMessages')
  }
}

export default ApiClient