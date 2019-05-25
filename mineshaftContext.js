import React, { useState, useEffect } from 'react'
import { getMineshaft } from './mineshaft' 

const MineshaftContext = React.createContext()

export function ConnectMineshaft ({ children }) {
  return (
    <MineshaftContext.Provider value={getMineshaft()}>
      {children}
    </MineshaftContext.Provider>
  )
}

export default MineshaftContext

