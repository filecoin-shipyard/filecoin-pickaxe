import React, { useState, useEffect } from 'react'
import { Box } from 'ink'
import GroupContext from './groupContext'
import addFile from './addFile' 
import ListBundles from './listBundles'

function Add ({ fileOrDir, group, onError }) {
  const [added, setAdded] = useState()

  useEffect(() => {
    let unmounted = false
    async function run () {
      await addFile({ group, fileOrDir, onError })
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
  return (
    <GroupContext.Consumer>
      {
        group => {
          if (!group) {
            return <Box>Loading...</Box>
          }
          return (
            <Add fileOrDir={fileOrDir} group={group} onError={onError} />
          )
        }
      }
    </GroupContext.Consumer>
  )
}
