import fs from 'fs'
import { serch, getChannels, getPlaylist } from './api/index.js'
import { Usecase } from './getChannelsDetail.js'
import { ChannelsDetail } from './types/index.js'
import { successWriteFile, addChannelUrl, createCSV } from './utils/index.js'

import channelIdsJson from './res/channelIds.json' assert { type: 'json' }
import filterdChannelsDetail from './res/filterdChannelsDetail.json' assert { type: 'json' }
import filterdChannelsDetailAddYoutubeUrl from './res/addYoutubeUrl.json' assert { type: 'json' }
import activeChannelsDetail from './res/activeChannelsDetail.json' assert { type: 'json' }
