import React, { useState, useEffect } from 'react'
import { getGroup } from './group' 

const GroupContext = React.createContext()

export function ConnectGroup ({ children }) {
  const [group, setGroup] = useState()

  useEffect(() => {
    const group = getGroup()
    setGroup(group)
    // FIXME: Can we do groupStop() from here?
  }, [])

  return (
    <GroupContext.Provider value={group}>
      {children}
    </GroupContext.Provider>
  )
}

export default GroupContext

