import { motion } from 'framer-motion'
import styled from 'styled-components'
import { getBreakpoint, getColor } from 'utils/theme'

export const NetworkComparisonSingleNetworkWrapper = styled(motion.div)`
  position: absolute;
  inset: 0;
  width: 50%;

  border-radius: 0.5rem;
  overflow: hidden;

  background-color: ${getColor('palette:black')};

  display: flex;
  flex-grow: 1;
  flex-shrink: 1;
  justify-content: center;
  align-items: center;
`

export const NetworkComparisonContent = styled.div`
  position: relative;
  height: calc(100% - 0.5rem);

  display: flex;
  /* grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr;
  grid-gap: 0.5rem; */

  /* ${getBreakpoint('xl')} {
    flex-direction: row;
  } */
`

export const NetworkComparisonWrapper = styled(motion.div)`
  position: fixed;
  top: var(--nav-height);
  bottom: 0;
  left: 0;
`
