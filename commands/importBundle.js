import fs from 'fs'
import React, { useState, useEffect } from 'react'
import { Box } from 'ink'
import Filecoin from 'filecoin-api-client'
import GroupContext from '../groupContext'
import ExitNow from '../inkExitNow'
import WatchForExitKey from '../inkWatchForExitKey'

const fc = Filecoin()

function Import ({ group }) {
  const [file, setFile] = useState()
  const [cid, setCid] = useState()
  const [error, setError] = useState()

  useEffect(() => {
    let unmounted
    const files = group.collaboration.shared.value()
    if (files.length === 0) return
    const lastFile = files[files.length - 1]
    const match = lastFile.match(/^Add: \d+ (.*)$/)
    if (!match) return
    const file = match[1]
    setFile(file)
    const data = fs.createReadStream(file)
    fc.client.import(data)
      .then(cid => !unmounted && setCid(cid.toString()))
      .catch(error => !unmounted && setError(error))

    /*
    function doWork () {
      count++
      setCounter(count)
      if (count <= 10) {
        setTimeout(doWork, 1000)
      } else {
        setDone(true)
      }
    }
    setTimeout(doWork, 0)
    */
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

