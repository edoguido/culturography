import { Fragment } from 'react'

import { GlobalStyle } from '../lib/utils/theme'
// import theme from '../public/design-tokens.json'

import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  return (
    <Fragment>
      <GlobalStyle />
      <Component {...pageProps} />
    </Fragment>
  )
}

export default MyApp
