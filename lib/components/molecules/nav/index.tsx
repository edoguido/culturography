import Link from 'next/link'

import ModeSwitcher from 'components/atoms/modeSwitcher'

import { useVizLayout } from '@/context/vizLayoutContext'
import * as Styled from './styled'

const Nav = () => {
  const [state] = useVizLayout()
  const { title } = state.story.data

  return (
    <Styled.NavWrapper>
      <Styled.NavContent>
        <Styled.NavProjectHeaderSection>
          <Link href="/">
            <Styled.NavLogo>The Cultural Impact Index</Styled.NavLogo>
          </Link>
          <Styled.NavProjectName>{title}</Styled.NavProjectName>
        </Styled.NavProjectHeaderSection>
        <Styled.NavSection>
          <ModeSwitcher />
        </Styled.NavSection>
      </Styled.NavContent>
    </Styled.NavWrapper>
  )
}

export default Nav
