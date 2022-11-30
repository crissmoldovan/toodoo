#!/usr/bin/env node
import Table from 'cli-table'
import { Command } from 'commander'
const { default: ora } = require('fix-esm').require('ora')
import {
  fetchDoneCards,
  fetchInProgressCards,
  fetchPendingCards,
  ParsedTrelloCard
} from 'src/trello'
const { default: inquirer } = require('fix-esm').require('inquirer')
import { init as initConfig } from '../config'
import { displayTrelloInfo } from './toodoo-trello-info'

const displayCards = async (cards: ParsedTrelloCard[]) => {
  const table = new Table({
    head: ['Name', 'File (Line)', 'Status', 'Link'],
    colWidths: [50, 70, 10, 20]
  })

  cards.forEach(card => {
    table.push([
      // @ts-ignore
      card.card.name,
      // @ts-ignore
      `${card.file}:${card.line}`,
      // @ts-ignore
      card.status,
      // @ts-ignore
      card.card.shortUrl
    ])
  })

  console.log(table.toString())
}

const program = new Command()
  .name('trello')
  .command('info', 'Display trell info')
  .action(async () => {
    const answers = await inquirer.prompt({
      type: 'list',
      name: 'action',
      message: 'What would you like to see?',
      choices: [
        {
          name: 'Trello info',
          value: 'info'
        },
        {
          name: 'Pending cards',
          value: 'pending'
        },
        {
          name: 'Completed cards',
          value: 'completed'
        },
        {
          name: 'All cards',
          value: 'all'
        }
      ]
    })

    if (answers.action === 'pending') {
      const spinner = ora('Fetching pending cards').start()
      const pendingCards = await fetchPendingCards()
      const inProgressCards = await fetchInProgressCards()
      spinner.stop()

      // @ts-ignore
      displayCards([
        ...pendingCards.map(card => ({ ...card, status: 'pending' })),
        ...inProgressCards.map(card => ({ ...card, status: 'inprogress' }))
      ])
    }

    if (answers.action === 'info') {
      await displayTrelloInfo()
    }

    if (answers.action === 'completed') {
      const spinner = ora('Fetching completed cards').start()
      const doneCards = await fetchDoneCards()
      spinner.stop()

      displayCards(doneCards.map(card => ({ ...card, status: 'done' })))
    }

    if (answers.action === 'all') {
      const spinner = ora('Fetching cards').start()
      const pendingCards = await fetchPendingCards()
      const inProgressCards = await fetchInProgressCards()
      const doneCards = await fetchDoneCards()
      spinner.stop()

      // @ts-ignore
      displayCards([
        ...pendingCards.map(card => ({ ...card, status: 'pending' })),
        ...inProgressCards.map(card => ({ ...card, status: 'inprogress' })),
        ...doneCards.map(card => ({ ...card, status: 'done' }))
      ])
    }
  })

const start = async () => {
  await initConfig()

  program.parse(process.argv)
}

start()
