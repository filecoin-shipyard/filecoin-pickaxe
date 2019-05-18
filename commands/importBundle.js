import fs from 'fs'
import React, { useState, useEffect } from 'react'
import { Box } from 'ink'
import Filecoin from 'filecoin-api-client'
import GroupContext from '../groupContext'
import ExitNow from '../inkExitNow'
import WatchForExitKey from '../inkWatchForExitKey'
import useFilecoinVersion from '../useFilecoinVersion'

const fc = Filecoin()

function Import ({ group }) {
  const [file, setFile] = useState()
  const [cid, setCid] = useState()
  const [error, setError] = useState()
  // const [version] = useFilecoinVersion()
  // FIXME: go-filecoin version API call was removed

  useEffect(() => {
    let unmounted
    // if (!version) return
    const files = group.collaboration.shared.value()
    if (files.length === 0) return
    const lastFile = files[files.length - 1]
    const { name, sources } = JSON.parse(lastFile)
    const file = sources[0].file // FIXME: Quick hack
    setFile(file)
    const data = fs.createReadStream(file)
    fc.client.import(data)
      .then(async cid => {
        if (unmounted) return
        const cidString = cid.toString()
        const bundleImports = await group.bundleImports()
        const record = {
          sources: [
            {
              single: cidString,
              // filecoinVersion: version
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
    return () => { umounted = true }
  // }, [version])
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
      <Box>
        Error: {`${error}`}
      </Box>
    )
  }
  return (
    <Box flexDirection="column">
      <Box>
        File: {file}
      </Box>
      <Box>
        CID: {cid}
        {cid && <ExitNow />}
      </Box>
    </Box>
  )
}

export default function ImportBundle () {
  return (
    <GroupContext.Consumer>
      {
        group => {
          if (!group) {
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
              <Import group={group} />
              <WatchForExitKey />
            </>
          )
        }
      }
    </GroupContext.Consumer>
  )
}

