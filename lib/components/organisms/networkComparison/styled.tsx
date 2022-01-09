import { motion } from 'framer-motion'
import styled from 'styled-components'
import { getBreakpoint, getColor } from 'utils/theme'

export const NetworkComparisonSingleNetworkWrapper = styled.div`
  position: relative;
  margin: 0.25rem 0.5rem;

  border-radius: 0.5rem;
  overflow: hidden;

  background-color: ${getColor('palette:white')};

  display: flex;
  flex: 1 0 auto;
  justify-content: center;
  align-items: center;
`

export const NetworkComparisonContent = styled.div`
  position: relative;
  height: 100%;

  display: flex;
  flex-direction: column;

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
