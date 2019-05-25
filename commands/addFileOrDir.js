import React, { useState, useEffect } from 'react'
import { Box } from 'ink'
import MineshaftContext from '../mineshaftContext'
import addFile from './addFile' 
import ListBundles from './listBundles'
import useFilecoinConfig from '@jimpick/use-filecoin-config'

function Add ({ fileOrDir, mineshaft, nickname, onError }) {
  const [added, setAdded] = useState()

  useEffect(() => {
    let unmounted = false
    async function run () {
      await addFile({ mineshaft, fileOrDir, nickname, onError })
      if (!unmounted) {
        setAdded(true)
      }
    }
    run()
    return () => { unmounted = true }
  }, [])

  return added ? <ListBundles /> : <Box>Adding...</Box>
}

export default function AddFileOrDir ({ fileOrDir, onError }) {
  const [nickname] = useFilecoinConfig('heartbeat.nickname')
  return (
    <MineshaftContext.Consumer>
      {
        mineshaft => {
          if (!mineshaft || !nickname) {
            return <Box>Loading...</Box>
          }
          return (
            <Add
              mineshaft={mineshaft}
              fileOrDir={fileOrDir}
              nickname={nickname}
              onError={onError} />
          )
        }
      }
    </MineshaftContext.Consumer>
  )
}
