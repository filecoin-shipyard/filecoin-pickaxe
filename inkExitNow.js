import React, { useEffect } from 'react'
import { AppContext } from 'ink'

function Exit ({ onExit, error }) {
  useEffect(() => {
    if (error) {
      onExit(new Error(error))
    } else {
      onExit()
    }
  }, [])
  return null
}

export default function ExitNow ({ error }) {
  return (
    <AppContext.Consumer>
      {({ exit }) => <Exit onExit={exit} error={error} />}
    </AppContext.Consumer>
  )
}

