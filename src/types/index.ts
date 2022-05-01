type ChannelsDetail = {
  id: string
  channelName: string
  desc: string
  subscriberCount: string
  uploadsPlaylistId: string
  lastUpload?: string
}

type MoviesInfo = {
  id: string
  url: string
  title: string
  channelId: string
  uploadAt: string
  desc: string
  thumbnails: string
}

export { ChannelsDetail, MoviesInfo }
