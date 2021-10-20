import { createGlobalStyle } from 'styled-components'

import theme from '@/../public/design-tokens.json'

const { color } = theme

export const GlobalStyle = createGlobalStyle`

  :root {
    ${themeValuesToCSSGlobalVar(color)}
  }

`

function themeValuesToCSSGlobalVar(obj) {
  //
  return Object.entries(obj).map(([key, values]) => {
    //
    if (!values.type) return themeValuesToCSSGlobalVar(values)
    if (typeof values.value === 'object') return null

    return `--${key}: ${values.value};`
  })
}

export function getBreakpoint(value, minmax) {
  return (themeObj) => {
    const breakpoint = themeObj.theme.breakpoints[value].value

    if (minmax.toUpperCase() === 'MIN') {
      return `@media (min-width: ${breakpoint}px)`
    }

    return `@media (max-width: ${breakpoint}px)`
  }
}

export function getColor(stringValue) {
  return (themeObj) => {
    //
    const value = stringValue.split(':')
    const isNestedValue = value.length > 1

    if (!isNestedValue) return themeObj.theme.color[value].value

    return themeObj.theme.color[value[0]][value[1]].value
  }
}
