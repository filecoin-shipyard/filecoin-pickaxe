import React, { useState, useEffect } from 'react'
import Filecoin from 'filecoin-api-client'

const fc = Filecoin()

export default function useFilecoinVersion () {
  const [value, setValue] = useState()

  useEffect(() => {
    let unmounted = false
    async function run () {
      const value = await fc.version()
      if (!unmounted) {
        setValue(value)
      }
    }
    run()
    return () => { unmounted = true }
  }, true)

  return [value]
}
