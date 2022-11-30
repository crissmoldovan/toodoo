import { promises as fs, existsSync } from 'fs'
import path from 'path'
import { TrelloConfig } from 'src/trello/config'
import { init as initTrello, setup as setupTrello } from '../trello'
import { config as trelloConfig } from '../trello/config'
import { checkSetup } from '../'

const { default: inquirer } = require('fix-esm').require('inquirer')
const { default: logSymbols } = require('fix-esm').require('log-symbols')

export const JSON_CONFIG_FILENAME = 'toodoo.config.json'

export type Config = {
  useConfigFile?: boolean
  configPath?: string
  pmTool?: string
  isCi?: boolean
  trello?: TrelloConfig
}

export let config: Config = {
  useConfigFile: false,
  configPath: process.env.TOODOO_CONFIG_PATH,
  pmTool: process.env.TOODOO_PM_TOOL || 'trello',
  isCi: process.env.TOODOO_CI === 'true',
  trello: trelloConfig
}

export const readConfig = async (configParam?: Config): Promise<Config> => {
  if (configParam) {
    config = {
      ...config,
      ...configParam
    }
  }

  const jsonConfigPath = path.resolve(process.cwd(), JSON_CONFIG_FILENAME)

  const configPath =
    config.configPath ||
    jsonConfigPath ||
    path.resolve(process.cwd(), JSON_CONFIG_FILENAME)

  if (!(await existsSync(configPath))) {
    config.useConfigFile = false
  } else {
    config.useConfigFile = true
  }

  if (config.useConfigFile) {
    const isJson = configPath.endsWith('.json')

    if (!isJson) throw new Error('Config file must be .json')

    const file = await fs.readFile(configPath, 'utf8')
    const parsed = JSON.parse(file)

    config = {
      ...config,
      ...parsed
    }
  }

  return config
}

export const outputConfigAsEnv = () => {
  console.log(`TOODOO_PM_TOOL=${config.pmTool}`)
  console.log(`TOODOO_CI=${config.isCi}`)

  if (config.pmTool === 'trello') {
    console.log(`TOODOO_TRELLO_KEY=${config.trello?.key}`)
    console.log(`TOODOO_TRELLO_TOKEN=${config.trello?.token}`)
    console.log(`TOODOO_TRELLO_PENDING_LIST_ID=${config.trello?.pendingListId}`)
    console.log(
      `TOODOO_TRELLO_INPROGRESS_LIST_ID=${config.trello?.inProgressListId}`
    )
    console.log(`TOODOO_TRELLO_DONE_LIST_ID=${config.trello?.doneListId}`)
  }
  process.exit(0)
}

export const writeConfig = async (config: Config): Promise<void> => {
  const configPath =
    config.configPath || path.resolve(process.cwd(), JSON_CONFIG_FILENAME)

  if (config.isCi) {
    console.log(
      logSymbols.warning,
      'please ensure these values are present in your CI environment'
    )
    outputConfigAsEnv()
  } else {
    const isJson = configPath.endsWith('.json')

    if (isJson) {
      await fs.writeFile(configPath, JSON.stringify(config, null, 2))
      console.log(logSymbols.success, 'config file saved to: ', configPath)
      process.exit(0)
    }
  }
}

export const init = async (
  _config: Config = {},
  ignoreMissing: boolean = false
): Promise<void> => {
  await readConfig(_config)

  let setupIsOk = false

  try {
    if (!ignoreMissing) checkSetup()
    setupIsOk = true
  } catch (e: any) {
    setupIsOk = false
  }

  if (!setupIsOk) {
    console.log(
      logSymbols.warning,
      'Please run `toodoo setup` to configure TooDoo, or set the relevant .evn variables'
    )
    process.exit(1)
  }

  if (setupIsOk || config.pmTool === 'trello') {
    setupIsOk = await initTrello()
  }

  if (!setupIsOk) {
    process.exit(1)
  }
}

export const setup = async (_config?: Config) => {
  await readConfig(_config)

  // checkSetup()

  if (config.isCi) {
    console.log(
      logSymbols.error,
      'toodoo setup is not supported in CI mode. please tun this in your local environment'
    )
    process.exit(1)
  }

  // only try to resolve config path if toodo does not run in CI
  if (!config.configPath) {
    config.configPath = path.resolve(process.cwd(), JSON_CONFIG_FILENAME)
  }

  const questions = [
    {
      type: 'list',
      name: 'pmTool',
      message: 'Which PM tool do you want to use?',
      choices: ['trello'],
      default: 'trello'
    }
  ]

  const answers = await inquirer.prompt(questions)

  config.pmTool = answers.pmTool

  if (config.pmTool === 'trello') {
    config = await setupTrello(config)
  }

  await writeConfig(config)
}
