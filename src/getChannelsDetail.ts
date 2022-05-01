import fs from 'fs'
import { serch, getChannels, getPlaylist } from './api/index.js'
import { ChannelsDetail } from './types/index.js'
import { successWriteFile, addChannelUrl, createCSV } from './utils/index.js'

import channelIdsJson from './res/channelIds.json' assert { type: 'json' }
import filterdChannelsDetail from './res/filterdChannelsDetail.json' assert { type: 'json' }
import filterdChannelsDetailAddYoutubeUrl from './res/addYoutubeUrl.json' assert { type: 'json' }
import activeChannelsDetail from './res/activeChannelsDetail.json' assert { type: 'json' }

/**
 * チャンネルIDを取得する
 * @param query 検索したい文字列
 */
async function getChannelIds(query: string, write: boolean = false): Promise<string[]> {
  let nextPageToken = ''
  let count = 0
  const results: any[] = []

  const id = await new Promise((resolve: (value: NodeJS.Timer) => void) => {
    let _intervalId: NodeJS.Timer
    _intervalId = setInterval(async () => {
      if (count < 5) {
        const data = await serch(query, 'channel', nextPageToken).catch((err) => {
          console.log(err)
          resolve(_intervalId)
        })
        nextPageToken = data.nextPageToken
        console.log('取得件数: ', count + 1)
        results.push(data)
        count++
      } else {
        resolve(_intervalId)
      }
    }, 1000)
  })
  clearInterval(id)

  const channelIds: string[] = []

  results.forEach((result) => {
    channelIds.push(...result.items.map((res: any) => res.id.channelId))
  })

  write && fs.writeFile('/src/res/channelIds.json', JSON.stringify(channelIds), successWriteFile)

  return channelIds
}

function subscriberMillionFilter(_channelsDetail: any): boolean {
  const requierSubscriberCount = 10000
  return _channelsDetail.statistics.subscriberCount > requierSubscriberCount
}

/**
 * チャンネルIDからチャンネルを収集する
 */
async function getChannelsDetailFromIds(
  channelIds: string[],
  filter: (arg: any) => boolean,
  write: boolean = false
): Promise<ChannelsDetail[]> {
  let result: any = []
  const channelsDetail: any[] = []

  await Promise.all(
    channelIds.map(async (id) => {
      return getChannels(id)
    })
  )
    .then((value: any[]) => {
      channelsDetail.push(...value.map((v) => v.items[0]))
    })
    .catch((err) => console.log(err))

  write && fs.writeFile('src/res/channelsDetail.json', JSON.stringify(channelsDetail), successWriteFile)

  const filteredChannelsDetail = channelsDetail.filter(filter)

  filteredChannelsDetail.forEach((_channelDetail) => {
    result.push({
      id: _channelDetail.id,
      channelName: _channelDetail.snippet.title,
      desc: _channelDetail.snippet.description,
      subscriberCount: _channelDetail.statistics.subscriberCount,
      uploadsPlaylistId: _channelDetail.contentDetails.relatedPlaylists.uploads,
    })
  })

  write && fs.writeFile('src/res/filterdChannelsDetail.json', JSON.stringify(result), successWriteFile)

  return addChannelUrl(result)
}

async function checkIsActiveChannel(
  filterdChannelsDetail: ChannelsDetail[],
  limit = '2022-03-31T00:00:00Z',
  write = false
): Promise<ChannelsDetail[]> {
  const uploadsPlaylistIds = filterdChannelsDetail.map((v) => v.uploadsPlaylistId)
  let activeChannels: any[] = []

  await Promise.all(uploadsPlaylistIds.map(async (i) => getPlaylist(i, 'snippet,contentDetails'))).then(
    (playlistItems: any[]) => {
      activeChannels = playlistItems
        .filter((p) => new Date(p.items[0].contentDetails.videoPublishedAt) > new Date(limit))
        .map((p) => {
          return { channleId: p.items[0].snippet.channelId, lastUpload: p.items[0].contentDetails.videoPublishedAt }
        })
    }
  )

  const activeChannelsDetail = filterdChannelsDetail.filter((d) =>
    activeChannels.some((a) => {
      if (a.channleId === d.id) {
        Object.assign(d, { lastUpload: a.lastUpload })
        return true
      }
    })
  )
  write && fs.writeFile('src/res/activeChannelsDetail.json', JSON.stringify(activeChannelsDetail), successWriteFile)

  return activeChannelsDetail
}

/**
 * ユースケース
 */
const Usecase = async (q = 'ホラー'): Promise<ChannelsDetail[]> => {
  const channelIds = await getChannelIds(q, true)
  const channelsDetail = await getChannelsDetailFromIds(channelIds, subscriberMillionFilter)
  const activeChannelsDetail = await checkIsActiveChannel(channelsDetail, '2022-03-31T00:00:00Z', true)
  const result = addChannelUrl(activeChannelsDetail)
  createCSV(result)

  return result
}

export { Usecase }
