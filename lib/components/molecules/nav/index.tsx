import Link from 'next/link'

import ModeSwitcher from 'components/atoms/modeSwitcher'

import * as Styled from './styled'

const Nav = ({ title }) => {
  return (
    <Styled.NavWrapper>
      <Styled.NavContent>
        <Styled.NavProjectHeaderSection>
          <Link href="/" passHref>
            <Styled.NavLogo>The Cultural Impact Index</Styled.NavLogo>
          </Link>
          <Styled.NavProjectName>{title}</Styled.NavProjectName>
        </Styled.NavProjectHeaderSection>
        <Styled.NavSection>{/* <ModeSwitcher /> */}</Styled.NavSection>
      </Styled.NavContent>
    </Styled.NavWrapper>
  )
}

export default Nav
