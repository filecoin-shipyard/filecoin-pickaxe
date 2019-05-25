import React, { useState, useEffect } from 'react'
import { Box } from 'ink'
import MineshaftContext from '../mineshaftContext'
import ListBundles from './listBundles'

function Reset ({ mineshaft, onError }) {
  const [reset, setReset] = useState()

  useEffect(() => {
    if (!mineshaft) return
    const shared = mineshaft.collaboration.shared
    for (let i = 0; i <= shared.value().length; i++) {
      shared.removeAt(0)
    }
    setReset(true)
  }, [mineshaft])

  return reset ? <ListBundles /> : <Box>Resetting...</Box>
}

export default function ResetAllBundles ({ onError }) {
  return (
    <MineshaftContext.Consumer>
      {
        mineshaft => {
          if (!mineshaft) {
            return <Box>Loading...</Box>
          }
          return (
            <Reset mineshaft={mineshaft} onError={onError} />
          )
        }
      }
    </MineshaftContext.Consumer>
  )
}
