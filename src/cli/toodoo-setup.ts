#!/usr/bin/env node
import { Command } from 'commander'
import { setup } from '../config'

const program = new Command().name('setup').action(async () => {
  await setup()
})

const start = async () => {
  program.parse(process.argv)
}

start()
