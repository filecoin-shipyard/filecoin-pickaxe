import React, { useState, useEffect } from 'react'
import { Box } from 'ink'
import GroupContext from './groupContext'
import ExitNow from './inkExitNow'

function Import ({ group }) {
  const [counter, setCounter] = useState(0)
  const [done, setDone] = useState()

  useEffect(() => {
    let count = counter
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
  }, [])

  return (
    <Box>
      Counter: {counter}
      {done && <ExitNow />}
    </Box>
  )
}

export default function ImportBundle () {
  return (
    <GroupContext.Consumer>
      {
        group => {
          if (!group) {
            return <Box>Loading...</Box>
          }
          return (
            <>
              <Box>Import</Box>
              <Import group={group} />
            </>
          )
        }
      }
    </GroupContext.Consumer>
  )
}

