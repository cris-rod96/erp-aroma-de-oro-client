import axios from 'axios'
import { server } from '../config/index.config'
export const instance = axios.create({
  baseURL: `${server}`,
})
