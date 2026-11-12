import axios from 'axios'
import type { AxiosInstance } from 'axios'

export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || '/api'

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
})
