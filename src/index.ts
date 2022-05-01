import fs from 'fs'
import kuromoji from 'kuromoji'
import { serch, getChannels, getPlaylistItem } from './api/index.js'
import { Usecase } from './getChannelsDetail.js'
import { ChannelsDetail, MoviesInfo } from './types/index.js'
import { successWriteFile, addChannelUrl, createCSV } from './utils/index.js'
import channelDetail from './res/activeChannelsDetail.json' assert { type: 'json' }

async function getMoviesInfoFromChannelsDetail(data: ChannelsDetail[]): Promise<MoviesInfo[]> {
  let items: any = []
  await Promise.all(data.map((d) => getPlaylistItem(d.uploadsPlaylistId, 'snippet', 5))).then((values: any[]) => {
    items = [].concat(...values.map((v) => v.items))
  })
  const moviesInfo = items.map((i: any) => {
    return {
      id: i.snippet.resourceId.videoId,
      url: `https://www.youtube.com/watch?v=${i.snippet.resourceId.videoId}`,
      title: i.snippet.title,
      channelId: i.snippet.channelId,
      uploadAt: i.snippet.publishedAt,
      desc: i.snippet.description,
      thumbnails: i.snippet.thumbnails.default.url,
    } as MoviesInfo
  })
  fs.writeFile('./src/res/moviesInfo.json', JSON.stringify(moviesInfo), successWriteFile)

  return moviesInfo
}

function kuromojiCount(data: MoviesInfo[]) {
  const kuromojiBuilder = kuromoji.builder({ dicPath: 'node_modules/kuromoji/dict' })
  kuromojiBuilder.build((err, tokenizer) => {
    const moviesInfoWords = data.map((d) =>
      tokenizer.tokenize(`${d.title}${d.desc}`).map((v) => v.surface_form)
    ) as any[]

    const results = [].concat(...[].concat(...moviesInfoWords))

    const duplicatedCount: { [key: string]: number } = {}

    results.forEach((r) => {
      duplicatedCount[r] = (duplicatedCount[r] || 0) + 1
    })

    const countWords: { word: string; count: number }[] = []
    Object.entries(duplicatedCount).forEach((v) => {
      countWords.push({
        word: v[0],
        count: v[1],
      })
    })

    countWords.sort((a, b) => a.count - b.count)

    fs.writeFile('./src/res/countWords.json', JSON.stringify(countWords), successWriteFile)
    console.log(countWords)
  })
}

function getTags(data: MoviesInfo[]) {
  const tags = [].concat(...(data.map((d) => d.desc.match(/\#[^(,| | "|\n)]+/g)) as any)).filter((v) => v !== null)
  const uniqueTags = [...new Set(tags)]
  console.log(uniqueTags)
  fs.writeFile('./src/res/tags.json', JSON.stringify(uniqueTags), successWriteFile)
  return uniqueTags.map((t) => {
    return {
      tags: t,
    }
  })
}

// Usecase('ホラー')

// getTags(moviesInfo)
// const a = getTags(moviesInfo)
// createCSV(a)

// kuromojiCount(moviesInfo)

const createTagsCsv = async () => {
  const moviesInfo = await getMoviesInfoFromChannelsDetail(channelDetail)
  const tags = getTags(moviesInfo)
  createCSV(tags)
}

createTagsCsv()
