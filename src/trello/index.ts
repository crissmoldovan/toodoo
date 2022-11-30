import { TodoComment } from '../lib/leasot/definitions'
import { config, Config } from '../config'
import {
  testConection,
  getBoards,
  getLists,
  getCards,
  TrelloCard,
  TrelloBoard,
  createCard
} from '../lib/trello/client'

const { default: ora } = require('fix-esm').require('ora')
const { default: logSymbols } = require('fix-esm').require('log-symbols')
const { default: inquirer } = require('fix-esm').require('inquirer')

export type TodoSnippet = Pick<TodoComment, 'hash' | 'line' | 'file'>

export type ParsedTrelloCard = TodoSnippet & {
  status?: 'pending' | 'inprogress' | 'done'
  card: TrelloCard
}

const SEPARATOR = '----------------------------------------'

export const checkSetup = (): void => {
  if (!config) {
    throw new Error('Config is required')
  }
  if (!config.trello) {
    throw new Error('Trello config is missing')
  }

  if (!config.trello.key) {
    throw new Error('Trello key is required')
  }

  if (!config.trello.token) {
    throw new Error('Trello token is required')
  }

  if (!config.trello.inProgressListId) {
    throw new Error('Trello inprogressListID is required')
  }

  if (!config.trello.pendingListId) {
    throw new Error('Trello pendingListID is required')
  }

  if (!config.trello.doneListId) {
    throw new Error('Trello doneListID is required')
  }
}

export const init = async (): Promise<boolean> => {
  let setupIsOk = false

  try {
    await checkSetup()
    setupIsOk = true
  } catch (e: any) {
    setupIsOk = false
  }

  if (!setupIsOk) {
    console.log(
      logSymbols.warning,
      'Please run `toodoo setup` to configure Trello, or set the relevant .evn variables'
    )
  }

  return setupIsOk
}

export const checkAuth = async (): Promise<boolean> => {
  if (!config.trello) {
    throw new Error('Trello config is missing')
  }

  if (!config.trello.key) {
    throw new Error('Trello key is required')
  }

  if (!config.trello.token) {
    throw new Error('Trello token is required')
  }

  return true
}

export const setup = async (config: Config): Promise<Config> => {
  const questions = [
    {
      type: 'input',
      name: 'trello.key',
      message: 'Trello key',
      default: config.trello?.key
    },
    {
      type: 'input',
      name: 'trello.token',
      message: 'Trello token',
      default: config.trello?.token
    }
  ]

  const answers = await inquirer.prompt(questions)

  config.trello = {
    key: answers.trello.key,
    token: answers.trello.token
  }

  const spinner = ora('Testing connection to Trello...').start()
  try {
    const success = await testConection()

    if (!success) {
      spinner.fail('Connection to Trello failed')
      process.exit(1)
    }

    spinner.succeed('Connection to Trello successful')
  } catch (error: any) {
    spinner.fail('Connection to Trello failed: ' + error.message.data)
    process.exit(1)
  }

  await selectBoard(config)
  await selectLists(config)

  return config
}

const selectBoard = async (config: Config): Promise<TrelloBoard> => {
  if (!config.trello) {
    throw new Error('Trello config is missing')
  }

  let boards

  const spinner = ora('Fetching boards...').start()
  try {
    boards = await getBoards()
    spinner.succeed('Boards fetched')
  } catch (error: any) {
    spinner.fail('Fetching boards failed: ' + error.message.data)
    process.exit(1)
  }

  const questions = [
    {
      type: 'list',
      name: 'board',
      message: 'Select a board',
      choices: boards.map((board: { name: any }) => board.name)
    }
  ]

  const answers = await inquirer.prompt(questions)

  const board = boards.find(
    (board: { name: any }) => board.name === answers.board
  )

  if (!board) {
    throw new Error('Board not selected')
  }

  config.trello.boardId = board.id

  return board
}

const selectLists = async (config: Config): Promise<Config> => {
  if (!config.trello?.boardId) {
    console.log(logSymbols.error, 'Board ID is missing')
    process.exit(1)
  }

  let lists

  const spinner = ora('Fetching lists...').start()
  try {
    lists = await getLists(config.trello.boardId)
    spinner.succeed('Lists fetched')
  } catch (error: any) {
    spinner.fail('Fetching lists failed: ' + error.message.data)
    process.exit(1)
  }

  const pendingQuestion = {
    type: 'list',
    name: 'list',
    message: 'Select Pending list',
    choices: lists.map((list: { name: any }) => list.name)
  }

  const pendingAnswers = await inquirer.prompt([pendingQuestion])

  const pendingList = lists.find(
    (list: { name: any }) => list.name === pendingAnswers.list
  )

  if (!pendingList) {
    throw new Error('Pendingh list not selected')
  }

  const inprogressQuestion = {
    type: 'list',
    name: 'list',
    message: 'Select In Progress list',
    choices: lists
      .filter((item: { id: any }) => item.id !== pendingList.id)
      .map((list: { name: any }) => list.name)
  }

  const inProgressAnswers = await inquirer.prompt([inprogressQuestion])

  const inprogressList = lists.find(
    (list: { name: any }) => list.name === inProgressAnswers.list
  )

  if (!inprogressList) {
    throw new Error('In Progress list not selected')
  }

  const doneQuestion = {
    type: 'list',
    name: 'list',
    message: 'Select Done list',
    choices: lists
      .filter(
        (list: { id: any }) =>
          list.id !== inprogressList.id && list.id !== pendingList.id
      )
      .map((list: { name: any }) => list.name)
  }

  const doneAnswers = await inquirer.prompt([doneQuestion])

  const doneList = lists.find(
    (list: { name: any }) => list.name === doneAnswers.list
  )

  if (!doneList) {
    throw new Error('In Progress list not selected')
  }

  config.trello.pendingListId = pendingList?.id
  config.trello.inProgressListId = inprogressList.id
  config.trello.doneListId = doneList.id

  return config
}

const parseTooDooSnippet = (text: string): TodoSnippet | null => {
  const regex = new RegExp(`^${SEPARATOR}(.*)$`, 'ms')
  const match = text.match(regex)

  if (!match) {
    return null
  }

  const rows = match[1].split(`\n`)

  return rows.reduce((acc: any, row: string) => {
    if (row.trim() === '') return acc

    if (row.startsWith('hash:')) {
      acc.hash = row.replace('hash:', '').trim()
    }

    if (row.startsWith('file:')) {
      acc.file = row.replace('file:', '').trim()
    }

    if (row.startsWith('line:')) {
      acc.line = row.replace('line:', '').trim()
    }

    return acc
  }, {})
}

const parseCard = (card: TrelloCard): ParsedTrelloCard | null => {
  const snippet = parseTooDooSnippet(card.desc)

  if (!snippet) return null

  const { hash, file, line } = snippet
  return {
    hash,
    file,
    line,
    card
  }
}

const generateTooDooSnippet = (todo: TodoComment): string => {
  const snippet = [
    SEPARATOR,
    `hash: ${todo.hash}`,
    `file: ${todo.file}`,
    `line: ${todo.line}`
  ]

  return snippet.join(`\n`)
}

const fetchAndParseCardsForList = async (
  listId: string
): Promise<ParsedTrelloCard[]> =>
  (await getCards(listId))
    .map(parseCard)
    .filter(item => item !== null) as ParsedTrelloCard[]

export const fetchPendingCards = async (): Promise<ParsedTrelloCard[]> =>
  config.trello
    ? fetchAndParseCardsForList(config.trello.pendingListId as string)
    : []

export const fetchInProgressCards = async (): Promise<ParsedTrelloCard[]> =>
  config.trello
    ? fetchAndParseCardsForList(config.trello.inProgressListId as string)
    : []

export const fetchDoneCards = async (): Promise<ParsedTrelloCard[]> =>
  config.trello
    ? fetchAndParseCardsForList(config.trello.doneListId as string)
    : []

export const sync = async (todos: TodoComment[]): Promise<void> => {
  await checkSetup()

  if (!config.trello) {
    console.log(logSymbols.error, 'Trello config is missing')
    process.exit(1)
  }

  const spinner = ora('Loading trello cards...').start()
  const [pendingCards, inProgressCards, doneCards] = await Promise.all([
    fetchPendingCards(),
    fetchInProgressCards(),
    fetchDoneCards()
  ])

  const cardsByHash: Record<string, ParsedTrelloCard> = [
    ...pendingCards.map(card => ({
      status: 'pending',
      card
    })),
    ...inProgressCards.map(card => ({
      status: 'in-progress',
      card
    })),
    ...doneCards.map(card => ({
      status: 'done',
      card
    }))
  ].reduce(
    (acc: any, item: { status: any; card: any }) => ({
      ...acc,
      [item.card.hash]: item
    }),
    {}
  )
  spinner.stop()

  const newTodos = todos.filter(todo => !cardsByHash[todo.hash as string])

  const doneTodos = todos.filter(todo =>
    doneCards.find(card => card.hash === todo.hash)
  )

  const cardsWithoutTodo = [...pendingCards, ...inProgressCards].filter(
    card => !todos.find(todo => todo.hash === card.hash)
  )

  if (newTodos.length > 0) {
    const spinner = ora('Creating new cards').start()
    await Promise.all(
      newTodos.map(todo =>
        createCard(config.trello?.pendingListId as string, {
          name: todo.text,
          desc: generateTooDooSnippet(todo)
        })
      )
    )
    spinner.succeed(`${newTodos.length} new todos synced`)
  }

  if (doneTodos.length > 0) {
    for (const todo of doneTodos) {
      console.log(
        logSymbols.success,
        `"${todo.tag}:${todo.text}" in \`file://${todo.file}:${todo.line}\` is now done! this can be now removed from code`
      )
    }
  }

  if (cardsWithoutTodo.length > 0) {
    for (const card of cardsWithoutTodo) {
      console.log(
        logSymbols.warning,
        `Card "${card.card.name}" in Trello is not present in code anymore`
      )
    }
  }
}
