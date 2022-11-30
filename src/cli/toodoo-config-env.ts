#!/usr/bin/env node
import { Command } from 'commander'
import { init as initConfig, outputConfigAsEnv } from '../config'

const program = new Command().name('env').action(async () => {
  outputConfigAsEnv()
})

const start = async () => {
  await initConfig()

  program.parse(process.argv)
}

start()
