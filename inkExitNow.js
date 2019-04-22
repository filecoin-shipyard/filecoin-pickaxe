import React, { useEffect } from 'react'
import { AppContext } from 'ink'

function Exit ({ onExit }) {
  useEffect(onExit, [])
  return null
}

export default function ExitNow () {
  return (
    <AppContext.Consumer>
      {({ exit }) => <Exit onExit={exit} />}
    </AppContext.Consumer>
  )
}

