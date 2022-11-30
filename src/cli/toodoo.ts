#!/usr/bin/env node
import { Command } from 'commander'
import { run } from '../index'

const program = new Command()
  .name('toodoo')
  .argument('[glob]', 'glob to filter input files')
  .command('list', 'List todos')
  .command('setup', 'Initialize a new toodoo config file')
  .command('config', 'Interract with the config file')
  .command('trello', 'Interract with Trello')
  .action(run)

const start = async () => {
  program.parse(process.argv)
}

start()
