import { createGlobalStyle } from 'styled-components'

import theme from 'public/design-tokens.json'

const { color } = theme

export const GlobalStyle = createGlobalStyle`

  :root {
    ${themeValuesToCSSGlobalVar(color)}
  }

  body {
    color: var(--text);
  }

`

// getColor('text:black')
// getColor('palette:purple:500')
export function getColor(valueString) {
  return ({ theme }) => {
    const tokenPath = valueString.split(':')
    const isNestedValue = tokenPath.length > 1

    if (!isNestedValue) return theme.color[tokenPath].value

    return extractNestedValue(tokenPath, theme.color)
  }
}

export function getBreakpoint(value: PropertyKey, minmax?: String) {
  return ({ theme }) => {
    const breakpoint = theme.breakpoints[value].value

    if (minmax && minmax.toUpperCase() === 'MAX') {
      return `@media (max-width: ${breakpoint}px)`
    }

    return `@media (min-width: ${breakpoint}px)`
  }
}

export function globalCSSVarToPixels(varName) {
  if (typeof window === undefined) return

  const globalDocumentStyle = window.getComputedStyle(document.documentElement)
  const outputValue = globalDocumentStyle.getPropertyValue(varName)
  return {
    value: parseFloat(outputValue),
    unit: outputValue.replace(/[^a-zA-Z]+/g, ''),
  }
}

function themeValuesToCSSGlobalVar(obj) {
  //
  return Object.entries(obj).map(
    ([key, values]: [key: string, values: { type: string; value: any }]) => {
      //
      if (!values.type) return themeValuesToCSSGlobalVar(values)
      if (typeof values.value === 'object') return null

      return `--${key}: ${values.value};`
    }
  )
}

function extractNestedValue(pathArray: PropertyKey[], themeObject: Object) {
  let obj = themeObject

  pathArray.forEach((value) => {
    obj = obj[value]
  })

  if (!obj) {
    throw new Error(
      `Too many nesting levels for theme property - Expected 3, got ${pathArray.length}: [${pathArray}]`
    )
  }

  if (obj.hasOwnProperty('value')) return obj['value']

  console.group()
  console.warn(`No value property in Object:`)
  console.warn(JSON.stringify(obj, null, 2))
  console.groupEnd()

  throw new Error(
    `No value property in Object: ${JSON.stringify(obj, null, 2)}`
  )
}
