import { extractTodosFromGlob } from 'src/parser'
import { config, init } from './config'
import { sync as syncTrello } from './trello'

const { default: logSymbols } = require('fix-esm').require('log-symbols')

export const run = async (
  glob: string | string[] = '{,!(node_modules)/**/}*.{js,ts,jsx,tsx,css}'
): Promise<void> => {
  try {
    await init()
    const todos = await extractTodosFromGlob(glob)

    if (config.pmTool === 'trello') {
      await syncTrello(todos)
      process.exit(0)
    }
  } catch (e: any) {
    console.log(logSymbols.error, (e as Error).message)
    process.exit(1)
  }
}

export const checkSetup = () => {
  if (!config.configPath) {
    throw new Error(`Config file not found. Run 'toodoo setup' to create one.`)
  }

  if (!config.pmTool) {
    throw new Error(`No PM tool specified`)
  }
}
