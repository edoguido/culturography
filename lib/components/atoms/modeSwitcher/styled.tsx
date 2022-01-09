import styled from 'styled-components'
import { motion } from 'framer-motion'
import { getColor } from 'utils/theme'

export const ModeSwitcherToggleThumb = styled(motion.div)`
  position: absolute;
  width: 24px;
  height: 24px;
  background-color: ${getColor('palette:orange')};
  border-radius: 99rem;
`

export const ModeSwitcherToggleRail = styled.div`
  background-color: white;
  width: 36px;
  height: 12px;

  border-radius: 99rem;
`

export const ModeSwitcherToggle = styled.div`
  position: relative;

  width: 100%;
  height: 100%;
  margin: 0 1rem;

  display: flex;
  justify-content: center;
  align-items: center;
`
export const ModeSwitcherLabel = styled.span``

export const ModeSwitcherWrapper = styled(motion.button)`
  appearance: none;
  background-color: transparent;
  border: none;

  display: flex;
  justify-content: space-between;
  align-items: center;

  cursor: pointer;
  user-select: none;
`
