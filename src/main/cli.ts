import { app } from 'electron'

export function parseArgs(argv: string[], cwd: string): any {
  if (argv[0].includes('node')) {
    argv = argv.slice(1)
  }

  return require('yargs/yargs')(argv.slice(1))
    .usage('wavy [command] [arguments]')
    .help('help')
    .parse()
}
