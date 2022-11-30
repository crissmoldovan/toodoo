#!/usr/bin/env node
import { Command } from 'commander'
const { default: inquirer } = require('fix-esm').require('inquirer')
import { init as initConfig, outputConfigAsEnv, setup } from '../config'

const program = new Command()
  .name('config')
  .command('env', 'List config as env variables')
  .action(async () => {
    const answers = await inquirer.prompt({
      type: 'list',
      name: 'action',
      message: 'What do you want to do?',
      choices: [
        {
          name: 'List config as env variables',
          value: 'env'
        },
        {
          name: 'Edit config',
          value: 'edit'
        }
      ]
    })

    if (answers.action === 'env') {
      outputConfigAsEnv()
    }

    if (answers.action === 'edit') {
      await setup()
    }
  })

const start = async () => {
  await initConfig()

  program.parse(process.argv)
}

start()
