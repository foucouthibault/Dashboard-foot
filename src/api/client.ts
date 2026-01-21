import axios from 'axios'

const API_KEY = import.meta.env.VITE_API_KEY

export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'X-Auth-Token': API_KEY
  },
})
