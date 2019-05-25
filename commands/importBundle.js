import fs from 'fs'
import util from 'util'
import React, { useState, useEffect } from 'react'
import { Box } from 'ink'
import Filecoin from 'filecoin-api-client'
import MineshaftContext from '@jimpick/filecoin-pickaxe-mineshaft-context'
import ExitNow from '@jimpick/ink-exit-now'
import WatchForExitKey from '@jimpick/ink-watch-for-exit-key'

const stat = util.promisify(fs.stat)

const fc = Filecoin()

function Import ({ mineshaft }) {
  const [file, setFile] = useState()
  const [cid, setCid] = useState()
  const [error, setError] = useState()

  useEffect(() => {
    let unmounted
    const files = mineshaft.collaboration.shared.value()
    if (files.length === 0) return
    const lastFile = files[files.length - 1]
    const { name, sources } = JSON.parse(lastFile)
    const file = sources[0].file // FIXME: Quick hack
    setFile(file)
    async function run () {
      const stats = await stat(file)
      if (unmounted) return
      const data = fs.createReadStream(file)
      fc.client.import(data)
        .then(async cid => {
          if (unmounted) return
          const cidString = cid.toString()
          const bundleImports = await mineshaft.bundleImports()
          const record = {
            sources: [
              {
                single: cidString,
                stats
              }
            ]
          }
          bundleImports.shared.applySub(
            name, 'ormap', 'applySub',
            `${Date.now()}`, 'mvreg', 'write',
            JSON.stringify(record)
          )
          setCid(cidString)
        })
        .catch(error => !unmounted && setError(error))
    }
    run()
    return () => { umounted = true }
  }, [])

  if (!file) {
    return (
      <Box>
        No file
      </Box>
    )
  }
  if (error) {
    return (
      <Error>
        Error: {error.toString()}
      </Error>
    )
  }
  return (
    <Box flexDirection="column">
      <Box>
        File: {file}
      </Box>
      <Box>
        CID: {cid}
        {cid && <WatchForExitKey />}
      </Box>
    </Box>
  )
}

export default function ImportBundle () {
  return (
    <MineshaftContext.Consumer>
      {
        mineshaft => {
          if (!mineshaft) {
            return (
              <>
                <Box>Loading...</Box>
                <WatchForExitKey />
              </>
            )
          }
          return (
            <>
              <Box>Import</Box>
              <Import mineshaft={mineshaft} />
              <WatchForExitKey />
            </>
          )
        }
      }
    </MineshaftContext.Consumer>
  )
}

