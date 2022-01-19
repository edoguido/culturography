import styled from 'styled-components'
import { getColor } from 'utils/theme'

export const NavProjectName = styled.h2`
  font-size: 1rem;

  background-color: ${getColor('palette:orange')};
  color: ${getColor('palette:black')};
  padding: 0.3125rem 1rem;
  border-radius: 99rem;
  margin-left: 0.5rem;
`

export const NavLogo = styled.a`
  font-size: 1rem;
  cursor: pointer;
`

export const NavSection = styled.div``

export const NavProjectHeaderSection = styled(NavSection)`
  display: flex;
  align-items: center;

  margin: 0;
  font-size: 1rem;
  font-weight: normal;
`

export const NavContent = styled.div`
  height: 100%;

  display: flex;
  justify-content: space-between;
  align-items: center;
`

export const NavWrapper = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  height: var(--nav-height);

  z-index: 99;

  padding: 0 0.5rem;
`
