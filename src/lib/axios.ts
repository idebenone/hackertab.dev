import Axios from 'axios';
import { ResponseInterceptor } from './interceptors/ResponseInterceptor'

const getBaseApi = (fallback: string | undefined = undefined) => {
  return process.env.NODE_ENV === 'production' ? process.env.REACT_APP_API_URL : fallback
}


export const axios = Axios.create({
  baseURL: getBaseApi()
});
axios.interceptors.response.use(ResponseInterceptor);