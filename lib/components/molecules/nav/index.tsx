import Tutorial from 'components/organisms/tutorial'
import { AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import NetworkComparisonAnnouncer from '../networkComparisonAnnouncer'

// import ModeSwitcher from 'components/atoms/modeSwitcher'

const Nav = ({ title }) => {
  const [tutorial, setTutorial] = useState<boolean>(false)

  useEffect(() => {
    const userHasViewedTutorial = localStorage.getItem('userHasViewedTutorial')

    if (!userHasViewedTutorial) setTutorial(true)

    localStorage.setItem('userHasViewedTutorial', '1')
  }, [])

  return (
    <div className="fixed top-0 right-0 bottom-0 left-0 h-[var(--nav-height)] z-[999] px-2">
      <div className="h-full flex justify-between items-center">
        <div className="flex items-center m-0">
          <Link href="/" passHref>
            <a>
              <h1 className="text-lg">Culturographies</h1>
            </a>
          </Link>
          <h2 className="bg-white text-black text-lg py-1 px-4 rounded-full mx-2">
            {title}
          </h2>
          <NetworkComparisonAnnouncer />
        </div>
        <div>
          <button
            className="cursor-pointer rounded-full border-2 border-white w-7 h-7"
            onClick={() => setTutorial(true)}
          >
            ?
          </button>
        </div>
      </div>
      <AnimatePresence>
        {tutorial && <Tutorial onClose={() => setTutorial(false)} />}
      </AnimatePresence>
    </div>
  )
}

export default Nav
