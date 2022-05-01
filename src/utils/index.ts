import fs from 'fs'
import { stringify } from 'csv'
import { serch, getChannels, getPlaylistItem } from '../api/index.js'
import { ChannelsDetail } from '../types'

const successWriteFile = () => {
  console.log('-----------done------------')
}

function addChannelUrl(data: ChannelsDetail[]): ChannelsDetail[] {
  data.forEach((v) => {
    Object.assign(v, { id: `https://www.youtube.com/channel/${v.id}` })
  })

  fs.writeFile('src/res/addYoutubeUrl.json', JSON.stringify(data), successWriteFile)

  return data
}

/**
 * CSVを作る
 * @param data
 */
function createCSV(data: any[]) {
  stringify(data, { header: true }, (err, output) => {
    fs.writeFile('src/res/result.csv', output, successWriteFile)
  })
}

export { successWriteFile, addChannelUrl, createCSV }
