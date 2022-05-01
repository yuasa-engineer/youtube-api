import axios from 'axios'
import { API_KEY } from '../config.js'

const api = axios.create({
  baseURL: `https://www.googleapis.com/youtube/v3/`,
  timeout: 5000,
  headers: { 'X-Custom-Header': 'foobar' },
  params: {
    key: API_KEY,
  },
})

async function serch(q: string, type: string = 'video', pageToken: string = '') {
  const res = await api.get(`/search`, {
    params: {
      pageToken: pageToken,
      maxResults: 50,
      type: type,
      q: q,
      part: 'id',
    },
  })

  return res.data
}

async function getChannels(cId: string) {
  const res = await api.get('/channels', {
    params: {
      id: cId,
      key: API_KEY,
      part: 'snippet,statistics,contentDetails',
    },
  })

  return res.data
}

async function getPlaylist(pId: string, part: string = 'snippet') {
  const res = await api.get('/playlistItems', {
    params: {
      playlistId: pId,
      part: part,
      maxResults: 1,
    },
  })

  return res.data
}

export { serch, getChannels, getPlaylist }
