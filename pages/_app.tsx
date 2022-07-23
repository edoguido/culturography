import '../styles/globals.css'

import { useEffect } from 'react'
import { useRouter } from 'next/router'
import ReactGA from 'react-ga4'
import * as FullStory from '@fullstory/browser'

import { isDevelopment } from 'utils/dev'

const TRACKING_ID = process.env.TRACKING_ID

function App({ Component, pageProps }) {
  const router = useRouter()

  const initializeTracker = () => {
    ReactGA.initialize(TRACKING_ID)
  }

  const handleRouteChange = () => {
    ReactGA.send('pageview')
  }

  useEffect(() => {
    async function initFullStory() {
      FullStory.init({ orgId: 'o-1C65JZ-na1' /* , devMode: isDevelopment */ })
    }

    initFullStory()

    if (isDevelopment) return

    initializeTracker()

    router.events.on('routeChangeComplete', handleRouteChange)

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [])

  return <Component {...pageProps} />
}

export default App
