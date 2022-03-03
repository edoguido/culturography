import { useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'

import Tutorial from 'components/organisms/tutorial'
import NetworkComparisonAnnouncer from '../networkComparisonAnnouncer'

// import ModeSwitcher from 'components/atoms/modeSwitcher'

const Nav = ({ title }) => {
  const [tutorial, setTutorial] = useState<boolean>(false)
  const userHasViewedTutorial = localStorage.getItem('userHasViewedTutorial')

  function showTutorial() {
    setTutorial(true)
    localStorage.setItem('userHasViewedTutorial', '1')
  }

  function hideTutorial() {
    setTutorial(false)
  }

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
            className="flex cursor-pointer rounded-full border-2 border-white w-auto py-1 px-3"
            onClick={showTutorial}
          >
            <motion.div
              initial={{
                y: 20,
                opacity: 0,
              }}
              animate={{
                y: 0,
                opacity: 1,
              }}
            >
              {!userHasViewedTutorial ? 'Click here for tutorial' : '?'}
            </motion.div>
          </button>
        </div>
      </div>
      <AnimatePresence>
        {tutorial && <Tutorial onClose={hideTutorial} />}
      </AnimatePresence>
    </div>
  )
}

export default Nav
