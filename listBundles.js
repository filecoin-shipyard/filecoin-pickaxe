import React from 'react'
import { Box } from 'ink'
import GroupContext from './groupContext'
import ExitNow from './inkExitNow'

function ListAll ({ group }) {
  const files = group.collaboration.shared.value()
  return (
    <Box flexDirection="column">
      <Box>
        # of files: {files.length}
      </Box>
      {files.map((file, key) => <Box key={key}>{file}</Box>)}
      <ExitNow />
    </Box>
  )
}

export default function ListBundles () {
  return (
    <GroupContext.Consumer>
      {
        group => {
          if (!group) {
            return <Box>Loading...</Box>
          }
          return (
            <>
              <Box>ListBundles</Box>
              <ListAll group={group} />
            </>
          )
        }
      }
    </GroupContext.Consumer>
  )
}
