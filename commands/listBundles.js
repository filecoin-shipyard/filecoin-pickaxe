import path from 'path'
import React, { useEffect, useState } from 'react'
import { Box, Color } from 'ink'
import prettyBytes from 'pretty-bytes'
import MineshaftContext from '@jimpick/filecoin-pickaxe-mineshaft-context'
import ExitNow from '@jimpick/ink-exit-now'

function Bundle ({ bundle, bundleImports, flags }) {
  if (flags && flags.raw) {
    return (
      <Box>
        {bundle}
      </Box>
    )
  }
  const { name, sources } = JSON.parse(bundle)
  const { base } = path.parse(sources[0].file)
  const biv = bundleImports.shared.value()
  let cid
  if (biv[name]) {
    const times = Object.keys(biv[name])
      .map(time => Number(time))
      .sort()
    const last = biv[name][times[times.length - 1]]
    if (last) {
      const importRecord = JSON.parse([...last][0])
      cid = <Box>
        <Color magenta>
          {` ${prettyBytes(importRecord.sources[0].stats.size)}`}
        </Color>
        {` ${importRecord.sources[0].single}`}
      </Box>
    }
  }
  return (
    <Box flexDirection="column">
      <Box>
        <Color cyan>{name}:</Color>
      </Box>
      <Box>
        <Color yellow>{'  ' + base}</Color>
        {cid}
      </Box>
    </Box>
  )
}

function ListAll ({ mineshaft, bundleImports, flags }) {
  const bundles = mineshaft.collaboration.shared.value()
  return (
    <Box flexDirection="column">
      <Box>
        # of bundles: {bundles.length}
      </Box>
      {bundles.map((bundle, key) => (
        <Bundle
          key={key}
          bundle={bundle}
          bundleImports={bundleImports}
          flags={flags} />
      ))}
      <ExitNow />
    </Box>
  )
}

function ListBundlesWithImports ({ mineshaft, flags }) {
  const [bundleImports, setBundleImports] = useState()

  useEffect(() => {
    if (!mineshaft) return
    let unmounted = false
    async function run () {
      const loaded = await mineshaft.bundleImports()
      if (!unmounted) {
        setBundleImports(loaded)
      }
    }
    run()
    return () => { umounted = true }
  }, [mineshaft])

  if (!bundleImports) return <Box>Loading...</Box>

  return (
    <ListAll
      mineshaft={mineshaft}
      bundleImports={bundleImports}
      flags={flags} />
  )
}

export default function ListBundles ({ flags }) {
  return (
    <MineshaftContext.Consumer>
      {
        mineshaft => {
          if (!mineshaft) {
            return <Box>Loading...</Box>
          }
          return (
            <ListBundlesWithImports
              mineshaft={mineshaft}
              flags={flags} />
          )
        }
      }
    </MineshaftContext.Consumer>
  )
}
