#!/usr/bin/env node

import meow from 'meow'
import React, { useState } from 'react'
import { render, Box, Color } from 'ink'
import { CommandRouter, CommandMatch, CommandDefault } from './commandRouter'
import ExitNow from '@jimpick/ink-exit-now'
import { groupStart, groupStop } from './group'
import { ConnectGroup } from './groupContext'
import WatchForExitKey from '@jimpick/ink-watch-for-exit-key'
import ListBundles from './commands/listBundles'
import AddFileOrDir from './commands/addFileOrDir'
import ImportBundle from './commands/importBundle'
import ResetAllBundles from './commands/resetAllBundles'

const cli = meow(
  `
    Usage
      $ pickaxe <command> [options]

    Quick Start:

      $ pickaxe add <file>
      $ pickaxe import

    Commands:

      pickaxe help

        - shows this usage message

      pickaxe add <file>

        - creates a new "bundle" and adds a file.
        
        In the future, multiple files will be permitted per
        bundle, but for now, only a single file is supported

      pickaxe import [--bundle <bundle-name>]

        - processes all the sources in the bundle and imports
          them into the local Filecoin node. This involves:

          * gets data from sources:
              * reads files
          * importing the data into the local Filecoin node

      pickaxe ls [--raw]

        - lists all of the bundles

        --raw flag displays JSON data

      pickaxe reset-all

        - removes all bundles
  `,
  {
    flags: {
      raw: {
        type: 'boolean'
      }
    }
  }
)

const flags = cli.flags
const command = cli.input[0]

if (!command) {
  console.error('Missing command')
  console.error('Run `pickaxe --help` for help')
  process.exit(1)
}

if (command === 'help') {
  cli.showHelp()
}

const Main = () => {
  const [error, setError] = useState()

  if (error) {
    return (
      <Box>
        <Color red>Error: {error}</Color>
        <ExitNow error="Error displayed" />
      </Box>
    )
  }

  return (
    <ConnectGroup>
      <Box flexDirection="column">
        <CommandRouter command={command}>
          <CommandMatch command="add">
            <AddFileOrDir fileOrDir={cli.input[1]} onError={setError} />
          </CommandMatch>
          <CommandMatch command="ls">
            <ListBundles flags={flags}/>
          </CommandMatch>
          <CommandMatch command="import">
            <ImportBundle />
          </CommandMatch>
          <CommandMatch command="reset-all">
            <ResetAllBundles />
          </CommandMatch>
          <CommandMatch command="sync">
            <Box>Syncing via network...</Box>
            <WatchForExitKey />
          </CommandMatch>
          <CommandDefault>
            <Box flexDirection="column">
              <Box>
                <Color red>Didn't recognize command: {command}</Color>
              </Box>
              <Box>Run `pickaxe --help` for help</Box>
              <ExitNow error="Error displayed" />
            </Box>
          </CommandDefault>
        </CommandRouter>
      </Box>
    </ConnectGroup>
  )
}

async function run () {
  await groupStart()

  const { unmount, rerender, waitUntilExit } = render(<Main />)

  process.on('SIGWINCH', () => rerender(<Main />))

  try {
    await waitUntilExit()
    await groupStop()
    process.exit(0)
  } catch (e) {
    if (e.message !== 'Error displayed') {
      console.error(e)
    }
    process.exit(1)
  }
}

run()
