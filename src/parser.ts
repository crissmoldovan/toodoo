import { parse as parseSourceFile } from './lib/leasot'
import fs from 'fs'
import path from 'path'
import { TodoComment } from './lib/leasot/definitions'
import hashObject from 'object-hash'

const { globbySync } = require('fix-esm').require('globby')
const { default: logSymbols } = require('fix-esm').require('log-symbols')

export const extractTodosFromFile = async (
  content: string,
  filename: string
): Promise<TodoComment[]> => {
  const extension = path.extname(filename)

  const config = {
    extension,
    filename
  }

  const todos = await parseSourceFile(content, config)
  return todos.map(todo => fillTodo(todo))
}

const fillTodo = (todo: TodoComment) => {
  const mentions = extractMentionsinString(todo.text)
  const textWithoutMentions = removeMentionsFromString(todo.text)
  const hash = hashObject({
    text: textWithoutMentions.toLowerCase()
  })

  return {
    ...todo,
    mentions,
    hash
  }
}

export const extractTodosFromGlob = async (
  glob: string | string[]
): Promise<TodoComment[]> => {
  if (!glob) {
    throw new Error('fileGlobs is required')
  }

  const files = globbySync(glob)

  if (!files || !files.length) {
    console.log(logSymbols.warning, 'No files found for parsing')
    process.exit(1)
  }

  let todos: string | any[] = []

  for (const file of files) {
    const content = fs.readFileSync(path.resolve(process.cwd(), file), 'utf8')
    const retrievedTodos = await extractTodosFromFile(content, file)

    if (retrievedTodos.length > 0) {
      todos = [...todos, ...retrievedTodos]
    }
  }

  return todos
}

const extractMentionsinString = (content: string): string[] => {
  const mentions = content.match(/@[a-z0-9_-]+/gi)

  if (!mentions) {
    return []
  }

  return mentions
}

const removeMentionsFromString = (content: string): string => {
  return content.replace(/@[a-z0-9_-]+/gi, '')
}
