import React from 'react'
import { Box } from 'ink'

export default async function importBundle ({
  group,
  onError,
  onContent,
  onExit
}) {
  const bundles = group.collaboration.shared.value()
  let counter = 0
  function doWork () {
    counter++
    onContent(() => <Box>Counter: {counter}</Box>)
    if (counter <= 10) {
      setTimeout(doWork, 1000)
    } else {
      onExit()
    }
  }
  setTimeout(doWork, 0)
}
