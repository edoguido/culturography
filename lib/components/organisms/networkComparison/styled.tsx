import { motion } from 'framer-motion'
import styled from 'styled-components'
import { getBreakpoint, getColor } from 'utils/theme'

export const NetworkComparisonSingleNetworkWrapper = styled.div`
  position: relative;

  border-radius: 0.5rem;
  overflow: hidden;

  background-color: ${getColor('palette:black')};

  display: flex;
  flex: 1 0 auto;
  justify-content: center;
  align-items: center;
`

export const NetworkComparisonContent = styled.div`
  position: relative;
  height: calc(100% - 0.5rem);
  margin: 0 0.5rem;

  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 0.5rem;

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
