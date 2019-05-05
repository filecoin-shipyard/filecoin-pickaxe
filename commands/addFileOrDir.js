import React, { useState, useEffect } from 'react'
import { Box } from 'ink'
import GroupContext from '../groupContext'
import addFile from './addFile' 
import ListBundles from './listBundles'
import useFilecoinConfig from '../useFilecoinConfig'

function Add ({ fileOrDir, group, nickname, onError }) {
  const [added, setAdded] = useState()

  useEffect(() => {
    let unmounted = false
    async function run () {
      await addFile({ group, fileOrDir, nickname, onError })
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
    <GroupContext.Consumer>
      {
        group => {
          if (!group || !nickname) {
            return <Box>Loading...</Box>
          }
          return (
            <Add
              fileOrDir={fileOrDir}
              group={group}
              nickname={nickname}
              onError={onError} />
          )
        }
      }
    </GroupContext.Consumer>
  )
}
