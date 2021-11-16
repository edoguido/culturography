import { motion } from 'framer-motion'
import styled from 'styled-components'
import { getBreakpoint } from 'utils/theme'

export const NetworkComparisonSingleNetworkWrapper = styled.div`
  position: relative;

  background-color: lightblue;

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

  ${getBreakpoint('xl')} {
    flex-direction: row;
  }
`

export const NetworkComparisonWrapper = styled(motion.div)`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;

  padding-top: var(--nav-height);
`
