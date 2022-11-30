#!/usr/bin/env node
import { Command } from 'commander'
import { extractTodosFromGlob } from 'src/parser'
import { init as initConfig } from '../config'

import Table from 'cli-table'

const program = new Command()
  .name('list')
  .option(
    '-g, --glob <glob>',
    'glob to filter input files',
    '{,!(node_modules)/**/}*.{js,ts,jsx,tsx,css}'
  )
  .action(async (options): Promise<void> => {
    const { glob = '{,!(node_modules)/**/}*.{js,ts,jsx,tsx,css}' } = options
    const todos = await extractTodosFromGlob(glob)

    var table = new Table({
      head: ['Type', 'Text', 'File', 'Line'],
      colWidths: [6, 50, 40, 6]
    })

    todos.forEach(todo => {
      table.push([todo.tag, todo.text, todo.file, todo.line.toString()])
    })

    console.log(table.toString())
  })

const start = async () => {
  await initConfig()

  program.parse(process.argv)
}

start()
