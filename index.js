#!/usr/bin/env node

import meow from 'meow'
import React, { useState, useEffect } from 'react'
import { render, Box, Color, AppContext } from 'ink'
import useFilecoinConfig from './useFilecoinConfig'
import InkWatchForExitKey from './inkWatchForExitKey'
import joinGroup from './group' 
import addFile from './addFile' 
import importBundle from './importBundle' 

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

const CommandRouter = ({ command, children }) => {
  return (
    <>
    {
      React.Children.map(children, child => {
        return React.cloneElement(child, {
          routerCommand: command
        })
      })
    }
    </>
  )
}

const CommandMatch = ({ children, command, routerCommand }) => {
  if (command === routerCommand) {
    return (
      <>
      <Box>CommandMatch1: {command} {routerCommand}</Box>
      {children}
      </>
    )
  } else {
    return null
  }
}

const Main = ({ content, error, onExit }) => {
  const [nickname] = useFilecoinConfig('heartbeat.nickname')

  if (error) {
    setImmediate(onExit)
    return (
      <Box>
        <Color red>Error: {error}</Color>
      </Box>
    )
  }

  return (
    <Box flexDirection="column">
      <Box>
        Nickname: {nickname}
      </Box>
      <Box>
        Command: {command}
      </Box>
      <CommandRouter command={command}>
        <CommandMatch command="add">
          <Box>CommandMatch2: add</Box>
        </CommandMatch>
        <CommandMatch command="ls">
          <Box>CommandMatch2: ls</Box>
        </CommandMatch>
      </CommandRouter>
      {content && content({ onExit })}
      <InkWatchForExitKey />
    </Box>
  )
}

async function run () {
  let error
  let content

  const group = await joinGroup()

  if (command === 'add') {
    const fileOrDir = cli.input[1]
    await addFile({ group, fileOrDir, onError })
    content = listFiles()
  }

  if (command === 'import') {
    await importBundle({ group, onError, onContent, onExit })
  }

  if (command === 'ls') {
    content = listFiles()
  }

  function listFiles () {
    const files = group.collaboration.shared.value()
    return ({ onExit }) => {
      useEffect(onExit, [])
      return (
        <Box flexDirection="column">
          <Box>
            # of files: {files.length}
          </Box>
          {files.map((file, key) => <Box key={key}>{file}</Box>)}
        </Box>
      )
    }
  }

  function onError (err) {
    error = err
  }

  function main () {
    return (
      <AppContext.Consumer>
        {({ exit }) => (
          <Main
            onExit={exit}
            error={error}
            content={content} />
        )}
      </AppContext.Consumer>
    )
  }

  const { unmount, rerender, waitUntilExit } = render(main())

  process.on('SIGWINCH', () => rerender(main()))

  function onExit () {
    unmount()
  }

  function onContent (newContent) {
    content = newContent
    rerender(main())
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
