#!/usr/bin/env node

import meow from 'meow'
import React, { useState, useEffect } from 'react'
import { render, Box, Color } from 'ink'
import useFilecoinConfig from './useFilecoinConfig'
import InkWatchForExitKey from './inkWatchForExitKey'

const cli = meow(
  `
    Usage
      $ pickaxe <command> [options]

    Quick Start:

      $ pickaxe add <file>
      $ pickaxe import
      $ pickaxe cids

    Commands:

      pickaxe init [name]

        - creates a new pickaxe group for organizing nodes, and adds
          an entry for this Filecoin node to it

      pickaxe bundle create <bundlename>

        - creates a new "bundle" to manage files from a set of sources

      pickaxe add <file or directory>

        - adds the file or directory as a source in the bundle

      pickaxe import

        - processes all the sources in the bundle and imports
          them into the local Filecoin node. This involves:

          * gets data from sources:
              * reads files / traversing directories
          * importing the data into the local Filecoin node

      pickaxe cids

        - lists the CIDs imported into the local Filecoin node
  `,
  {
    flags: {
    }
  }
)

const args = cli.flags

const Main = ({ done }) => {
  const [nickname] = useFilecoinConfig('heartbeat.nickname')
  if (nickname) {
    setImmediate(done)
  }
  return (
    <Box>
      Nickname: {nickname}
      <InkWatchForExitKey />
    </Box>
  )
}

async function run () {
  const { unmount, rerender, waitUntilExit } = render(<Main done={done}/>)

  process.on('SIGWINCH', () => rerender(<Main/>))

  function done () {
    unmount()
  }

  try {
    await waitUntilExit()
    process.exit(0)
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

run()
