import { Fragment } from 'react'
import { ThemeProvider } from 'styled-components'
import '../styles/globals.css'

import { GlobalStyle } from '../lib/utils/theme'
import theme from '../public/design-tokens.json'

function MyApp({ Component, pageProps }) {
  return (
    <Fragment>
      <GlobalStyle />
      <ThemeProvider theme={theme}>
        <Component {...pageProps} />
      </ThemeProvider>
    </Fragment>
  )
}

export default MyApp
