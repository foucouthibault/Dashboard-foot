import axios from 'axios'
import type { AxiosInstance } from 'axios'

const API_KEY = import.meta.env.VITE_API_KEY

if (!API_KEY) {
  console.warn('VITE_API_KEY is not defined in environment variables')
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'X-Auth-Token': API_KEY
  }
})
