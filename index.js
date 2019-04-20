#!/usr/bin/env node

import meow from 'meow'
import React, { useState, useEffect } from 'react'
import { render, Box, Color } from 'ink'
import useFilecoinConfig from './useFilecoinConfig'
import InkWatchForExitKey from './inkWatchForExitKey'
import joinGroup from './group' 
import addFile from './addFile' 

const cli = meow(
  `
    Usage
      $ pickaxe <command> [options]

    Quick Start:

      $ pickaxe add <file>
      $ pickaxe import
      $ pickaxe cids

    Commands:

      pickaxe init [groupname]

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
const command = cli.input[0]

const Main = ({ done, group, error }) => {
  if (error) {
    setImmediate(done)
    return (
      <Box>
        <Color red>Error: {error}</Color>
      </Box>
    )
  }

  const [nickname] = useFilecoinConfig('heartbeat.nickname')
  if (nickname) {
    setImmediate(done)
  }

  const files = group.collaboration.shared.value()
  const data = (
    <Box flexDirection="column">
      {files.map((file, key) => <Box key={key}>{file}</Box>)}
    </Box>
  )

  return (
    <Box flexDirection="column">
      <Box>
        Nickname: {nickname}
      </Box>
      <Box>
        Command: {command}
      </Box>
      <Box>
        # of files: {files.length}
      </Box>
      {data}
      <InkWatchForExitKey />
    </Box>
  )
}

async function run () {
  let error

  const group = await joinGroup()

  if (command === 'add') {
    const fileOrDir = cli.input[1]
    await addFile({ group, fileOrDir, onError })
  }

  function onError (err) {
    error = err
  }

  const main = (
    <Main
      done={done}
      group={group}
      error={error} />
  )

  const { unmount, rerender, waitUntilExit } = render(main)

  process.on('SIGWINCH', () => rerender(main))

  function done () {
    unmount()
  }

  try {
    await waitUntilExit()
    await group.stop()
    process.exit(0)
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

run()
