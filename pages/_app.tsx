import { useEffect } from 'react'
import { useRouter } from 'next/router'
import ReactGA from 'react-ga'

import '../styles/globals.css'
import { isDevelopment } from 'utils/dev'

const TRACKING_ID = process.env.TRACKING_ID

function App({ Component, pageProps }) {
  const router = useRouter()

  const initializeTracker = () => ReactGA.initialize(TRACKING_ID)

  const handleRouteChange = () =>
    ReactGA.pageview(window.location.pathname + window.location.search)

  useEffect(() => {
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
