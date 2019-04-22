import React, { useState, useEffect } from 'react'

export function CommandRouter ({ command, children }) {
  let matches = 0
  return (
    <>
    {
      React.Children.map(children, child => {
        if (child.type === CommandMatch && child.props.command === command) {
          matches++
          return child
        } else {
          return null
        }
      })
    }
    {
      matches === 0 && React.Children.map(children, child => {
        if (child.type === CommandDefault) {
          return child
        } else {
          return null
        }
      })
    }
    </>
  )
}

export function CommandMatch ({ children, command }) {
  return children
}

export function CommandDefault ({ children }) {
  return children
}


