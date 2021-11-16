import ModeSwitcher from 'components/atoms/modeSwitcher'
import * as Styled from './styled'

const Nav = () => {
  return (
    <Styled.NavWrapper>
      <Styled.NavContent>
        <Styled.NavSection>Section</Styled.NavSection>
        <Styled.NavSection>
          <ModeSwitcher />
        </Styled.NavSection>
      </Styled.NavContent>
    </Styled.NavWrapper>
  )
}

export default Nav
