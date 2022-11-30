#!/usr/bin/env node
import { Command } from 'commander'
import { getBoard, getList } from 'src/lib/trello/client'
const { default: ora } = require('fix-esm').require('ora')

import { config, init as initConfig } from '../config'

export const displayTrelloInfo = async () => {
  if (!config.trello) throw new Error('Trello config not found')

  const spinner = ora('Loading Trello info').start()
  const board = await getBoard(config.trello.boardId as string)
  const pendingList = await getList(config.trello.pendingListId as string)
  const inProgressList = await getList(config.trello.inProgressListId as string)
  const doneList = await getList(config.trello.doneListId as string)
  spinner.stop()

  console.log(`Active Board: (${config.trello?.boardId}) - ${board.shortUrl}`)
  console.log(
    `Pending List: (${config.trello?.pendingListId}) - ${pendingList.shortUrl}`
  )
  console.log(
    `InProgress List: (${config.trello?.inProgressListId}) - ${inProgressList.shortUrl}`
  )
  console.log(
    `Done List: (${config.trello?.doneListId}) - ${doneList.shortUrl}`
  )
}

const program = new Command().name('info').action(displayTrelloInfo)

const start = async () => {
  // return
  await initConfig()

  program.parse(process.argv)
}

start()
