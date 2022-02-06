import Link from 'next/link'

import ModeSwitcher from 'components/atoms/modeSwitcher'

import * as Styled from './styled'

const Nav = ({ title }) => {
  return (
    <Styled.NavWrapper>
      <Styled.NavContent>
        <Styled.NavProjectHeaderSection>
          <Link href="/" passHref>
            <Styled.NavLogo>Culturographies</Styled.NavLogo>
          </Link>
          <Styled.NavProjectName>{title}</Styled.NavProjectName>
        </Styled.NavProjectHeaderSection>
        <Styled.NavSection>{/* <ModeSwitcher /> */}</Styled.NavSection>
      </Styled.NavContent>
    </Styled.NavWrapper>
  )
}

export default Nav
