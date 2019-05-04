import React, { useState, useEffect } from 'react'
import { Box } from 'ink'
import GroupContext from '../groupContext'
import ListBundles from './listBundles'

function Reset ({ group, onError }) {
  const [reset, setReset] = useState()

  useEffect(() => {
    if (!group) return
    for (let i = 0; i <= group.collaboration.shared.value().length; i++) {
      group.collaboration.shared.removeAt(0)
    }
    setReset(true)
  }, [group])

  return reset ? <ListBundles /> : <Box>Resetting...</Box>
}

export default function ResetAllBundles ({ onError }) {
  return (
    <GroupContext.Consumer>
      {
        group => {
          if (!group) {
            return <Box>Loading...</Box>
          }
          return (
            <Reset group={group} onError={onError} />
          )
        }
      }
    </GroupContext.Consumer>
  )
}
