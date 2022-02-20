import Tutorial from 'components/organisms/tutorial'
import { AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useState } from 'react'

// import ModeSwitcher from 'components/atoms/modeSwitcher'

import * as Styled from './styled'

const Nav = ({ title }) => {
  const [tutorial, setTutorial] = useState<boolean>(false)

  useEffect(() => {
    const userHasViewedTutorial = localStorage.getItem('userHasViewedTutorial')

    if (!userHasViewedTutorial) setTutorial(true)

    localStorage.setItem('userHasViewedTutorial', '1')
  }, [])

  return (
    <Styled.NavWrapper>
      <Styled.NavContent>
        <Styled.NavProjectHeaderSection>
          <Link href="/" passHref>
            <Styled.NavLogo>Culturographies</Styled.NavLogo>
          </Link>
          <Styled.NavProjectName>{title}</Styled.NavProjectName>
        </Styled.NavProjectHeaderSection>
        <Styled.NavSection>
          <button
            className="cursor-pointer rounded-full border-2 border-white w-7 h-7"
            onClick={() => setTutorial(true)}
          >
            ?
          </button>
        </Styled.NavSection>
      </Styled.NavContent>
      <AnimatePresence>
        {tutorial && <Tutorial onClose={() => setTutorial(false)} />}
      </AnimatePresence>
    </Styled.NavWrapper>
  )
}

export default Nav
