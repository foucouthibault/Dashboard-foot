import axios from 'axios';

const API_URL = 'https://api.football-data.org/v4'
const API_KEY = import.meta.env.VITE_API_KEY

const instance = axios.create({
  baseURL: API_URL,
  headers: {
    'X-Auth-Token': API_KEY
  },
})

export async function getCompetitionStandings() {
  const response = await instance.get('/competitions/FL1/standings')
  return response.data
}
