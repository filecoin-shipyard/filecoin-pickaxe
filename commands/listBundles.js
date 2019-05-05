import path from 'path'
import React from 'react'
import { Box, Color } from 'ink'
import GroupContext from '../groupContext'
import ExitNow from '../inkExitNow'

function Bundle ({ bundle, flags }) {
  if (flags.raw) {
    return (
      <Box>
        {bundle}
      </Box>
    )
  }
  const { name, sources } = JSON.parse(bundle)
  const { base } = path.parse(sources[0].file)
  return (
    <Box flexDirection="column">
      <Box>
        <Color cyan>{name}:</Color>
      </Box>
      <Box>
        <Color yellow>{'  ' + base}</Color>
      </Box>
    </Box>
  )
}

function ListAll ({ group, flags }) {
  const bundles = group.collaboration.shared.value()
  return (
    <Box flexDirection="column">
      <Box>
        # of bundles: {bundles.length}
      </Box>
      {bundles.map((bundle, key) => (
        <Bundle key={key} bundle={bundle} flags={flags} />
      ))}
      <ExitNow />
    </Box>
  )
}

export default function ListBundles ({ flags }) {
  return (
    <GroupContext.Consumer>
      {
        group => {
          if (!group) {
            return <Box>Loading...</Box>
          }
          return <ListAll group={group} flags={flags} />
        }
      }
    </GroupContext.Consumer>
  )
}
