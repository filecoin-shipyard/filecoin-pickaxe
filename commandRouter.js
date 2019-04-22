import React, { useState, useEffect } from 'react'

export function CommandRouter ({ command, children }) {
  return (
    <>
    {
      React.Children.map(children, child => {
        return React.cloneElement(child, {
          routerCommand: command
        })
      })
    }
    </>
  )
}

export function CommandMatch ({ children, command, routerCommand }) {
  return command === routerCommand ? children : null
}

