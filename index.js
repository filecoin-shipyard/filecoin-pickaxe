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

      pickaxe init <name>

        - creates a new pickaxe group for organizing nodes, and adds
          an entry for this Filecoin node to it

      pickaxe invite

        - creates a real-time invite (using Magic Wormhole) to let
          another Filecoin node join the group

      pickaxe join <code>

        - accept an invite code to join this Filecoin node into a group

      pickaxe info

        - shows information about the active group

      pickaxe rename <name>

        - change the name of the pickaxe group

      pickaxe bundle create <bundlename>

        - creates a new "bundle" to manage files from a set of sources

      pickaxe bundle switch [bundlename]

        - switch to the named bundle. If no bundlename is specified,
          displays an interactive picker

      pickaxe bundle ls

        - lists the available bundles

      pickaxe bundle rm <bundlename>

        - remove a bundle

      pickaxe add <file or directory>

        - adds the file or directory as a source in the bundle

      pickaxe add-ipfs <ipfs cid or ipns path>

        - crawls IPFS at import time for data to import

      pickaxe ls

        - lists the sources in a bundle

      pickaxe rm <source-id>

        - removes a source from a bundle

      pickaxe import [--append]

        - processes all the sources in the bundle and imports
          them into the local Filecoin node. This involves:

          * gets data from sources:
              * reads files / traversing directories
              * resolves IPNS/IPFS cids, pulls data
          * optionally storing into an randomly-access
            archive format (zip), optionally split into multiple
            chunks and store index multiple times
          * optionally compressing using snappy, bzip2, or xz
          * optionally breaking files into a set of "Forward
            Error Correction" share files so that the original
            data can be recovered even if some files get lost
          * importing the data into the local Filecoin node

        - optionally, --append can be specified to tell the
          system to re-use already imported content

      pickaxe cids

        - lists the CIDs imported into the local Filecoin node

      pickaxe format <type>

        - configure the archive format for the bundle. Types are:

            * files - each file is stored independently (default)
            * zip - files are stored in a zip archive

      pickaxe chunk <size>

        - configure size of chunks that zip archive is broken into

      pickaxe zip-fec <required-shares>

        - when the zip is split into chunks, the index can be encoded
          into each chunk using "Forward Error Correction" so that
          the index can be recovered even if some chunks are lost.
          Possible values are:

            * 0   = Only include index in final chunk (smallest)
            * 1   = Include full index in every chunk (default)
            * > 1 = Use Python zfec to encode the index so that it
                    can be recovered even if only "required-shares"
                    number of chunks can be found
                     
      pickaxe compression <type> [<required-shares>]

        - configure the compression format for the bundle. Types are:

          Types:

            * none (default)
            * snappy 
            * bzip2
            * xz

      pickaxe fec off
      pickaxe fec on [<required-shares> <total-shares>]

        - configure "Forward Error Correction" using the Python zfec
          package. This re-encodes the file into a set of share files,
          a subset of which can be used to recover the original file.
          The default is 3 files out of 8 are needed to recover the
          data.
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
